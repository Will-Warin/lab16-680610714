import { useMemo, useState } from "react";
import { PlusCircle } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";

type Option = { value: string; label: string };

function OptionSelect({
  id,
  options,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  options: Option[];
  value: string | null;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <Select
      items={options}
      value={value}
      onValueChange={(v) => onChange(v as string)}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default function AdminEnrollmentsPage() {
  const { students, courses, setStudents } = useEnrollmentStore();

  const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
  const [formCourse, setFormCourse] = useState<string | null>(null);
  const [formStudentIds, setFormStudentIds] = useState<string[]>([]);

  const courseOptions: Option[] = courses.map((c) => ({
    value: c.courseCode,
    label: `${c.courseCode} — ${c.courseTitle}`,
  }));

  // นักศึกษาที่ยังไม่ได้ลงวิชาที่เลือกอยู่ (เลือกวิชาก่อนถึงจะมีตัวเลือก)
  const availableStudentOptions: Option[] = useMemo(() => {
    if (!formCourse) return [];
    return students
      .filter((s) => !s.enrolledCourses.includes(formCourse))
      .map((s) => ({
        value: s.studentId,
        label: `${s.studentId} — ${s.firstName} ${s.lastName}`,
      }));
  }, [students, formCourse]);

  // เปลี่ยนวิชา -> ล้างรายชื่อนักศึกษาที่เลือกไว้ (ข้อ 4.1)
  const handleCourseChange = (courseCode: string) => {
    setFormCourse(courseCode);
    setFormStudentIds([]);
  };

  const handleEnroll = () => {
    if (!formCourse || formStudentIds.length === 0) return;
    setStudents(
      students.map((s) =>
        formStudentIds.includes(s.studentId) &&
        !s.enrolledCourses.includes(formCourse)
          ? { ...s, enrolledCourses: [...s.enrolledCourses, formCourse] }
          : s,
      ),
    );
    setEnrollDialogOpen(false);
  };

  const handleDialogOpenChange = (open: boolean) => {
    setEnrollDialogOpen(open);
    if (!open) {
      setFormCourse(null);
      setFormStudentIds([]);
    }
  };

  // ลบนักศึกษาออกจากวิชานั้น (กด x บน Badge ในตาราง)
  const handleUnenroll = (courseCode: string, studentId: string) => {
    setStudents(
      students.map((s) =>
        s.studentId === studentId
          ? {
              ...s,
              enrolledCourses: s.enrolledCourses.filter(
                (c) => c !== courseCode,
              ),
            }
          : s,
      ),
    );
  };

  const nameOf = (studentId: string) => {
    const s = students.find((x) => x.studentId === studentId);
    return s ? `${s.firstName} ${s.lastName}` : "-";
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">จัดการการลงทะเบียน</h1>
        <p className="text-sm text-muted-foreground">
          Admin ลงทะเบียนและยกเลิกการลงทะเบียนให้นักศึกษาได้ทุกคน
        </p>
      </div>

      <Dialog open={enrollDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogTrigger render={<Button />}>
          <PlusCircle className="h-4 w-4" />
          ลงทะเบียนให้นักศึกษา
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลงทะเบียนให้นักศึกษา</DialogTitle>
            <DialogDescription>
              เลือกวิชาก่อน แล้วจึงเลือกนักศึกษาได้มากกว่า 1 คน
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="formCourse">วิชา</Label>
              <OptionSelect
                id="formCourse"
                options={courseOptions}
                value={formCourse}
                placeholder="เลือกวิชา"
                onChange={handleCourseChange}
              />
            </div>

            <div className="grid gap-1.5">
              <Label>นักศึกษา</Label>
              <Combobox
                items={availableStudentOptions.map((o) => o.value)}
                multiple
                value={formStudentIds}
                onValueChange={setFormStudentIds}
                disabled={!formCourse}
                itemToStringValue={(id) =>
                  availableStudentOptions.find((o) => o.value === id)
                    ?.label ?? id
                }
              >
                <ComboboxChips>
                  <ComboboxValue>
                    {formStudentIds.map((id) => (
                      <ComboboxChip key={id}>{nameOf(id)}</ComboboxChip>
                    ))}
                  </ComboboxValue>
                  <ComboboxChipsInput
                    placeholder={
                      formCourse ? "เลือกนักศึกษา" : "เลือกวิชาก่อน"
                    }
                  />
                </ComboboxChips>
                <ComboboxContent>
                  <ComboboxEmpty>ไม่พบนักศึกษา</ComboboxEmpty>
                  <ComboboxList>
                    {(id) => (
                      <ComboboxItem key={id} value={id}>
                        {availableStudentOptions.find((o) => o.value === id)
                          ?.label ?? id}
                      </ComboboxItem>
                    )}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
            </div>
          </div>

          <DialogFooter>
            <Button
              disabled={!formCourse || formStudentIds.length === 0}
              onClick={handleEnroll}
            >
              <PlusCircle className="h-4 w-4" />
              ลงทะเบียน ({formStudentIds.length} คน)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>จำนวน นศ.</TableHead>
              <TableHead>นักศึกษาที่ลงทะเบียน</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {courses.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-20 text-center text-muted-foreground"
                >
                  ยังไม่มีวิชา
                </TableCell>
              </TableRow>
            )}
            {courses.map((c) => {
              const enrolledStudents = students.filter((s) =>
                s.enrolledCourses.includes(c.courseCode),
              );
              return (
                <TableRow key={c.courseCode}>
                  <TableCell className="font-medium">
                    {c.courseCode}
                  </TableCell>
                  <TableCell>{c.courseTitle}</TableCell>
                  <TableCell>{enrolledStudents.length}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {enrolledStudents.length === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          ยังไม่มีนักศึกษาลงทะเบียน
                        </span>
                      ) : (
                        enrolledStudents.map((s) => (
                          <Badge
                            key={s.studentId}
                            variant="secondary"
                            className="gap-1"
                          >
                            {s.firstName} {s.lastName}
                            <button
                              type="button"
                              onClick={() =>
                                handleUnenroll(c.courseCode, s.studentId)
                              }
                              className="rounded-full hover:bg-muted-foreground/20"
                              aria-label={`ลบ ${s.firstName} ${s.lastName}`}
                            >
                              ×
                            </button>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
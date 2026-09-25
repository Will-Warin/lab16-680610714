import { useState } from "react";
import { PlusCircle, Trash2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEnrollmentStore } from "@/lib/enrollment-store";
import { cn } from "@/lib/utils";

const CREATE_PREFIX = "__create__:";

export default function AdminCoursesPage() {
  const { courses, setCourses, removeCourse } = useEnrollmentStore();

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [instructors, setInstructors] = useState<string[]>([]);
  const [instructorQuery, setInstructorQuery] = useState("");

  // รวมชื่อผู้สอนที่มีอยู่แล้วในทุกวิชา ไม่ซ้ำกัน
  const allInstructors = Array.from(
    new Set(courses.flatMap((c) => c.instructors ?? [])),
  );

  const trimmedQuery = instructorQuery.trim();
  const canCreateInstructor =
    trimmedQuery.length > 0 &&
    !allInstructors.some(
      (n) => n.toLowerCase() === trimmedQuery.toLowerCase(),
    ) &&
    !instructors.some((n) => n.toLowerCase() === trimmedQuery.toLowerCase());

  // ตัวเลือกที่ยังไม่ถูกเลือกในฟอร์มนี้ + ตัวเลือก "+ เพิ่มผู้สอน" ถ้าพิมพ์ชื่อใหม่
  const instructorItems: string[] = [
    ...allInstructors.filter((name) => !instructors.includes(name)),
    ...(canCreateInstructor ? [`${CREATE_PREFIX}${trimmedQuery}`] : []),
  ];

  const handleInstructorValueChange = (next: string[]) => {
    const created = next.find((v) => v.startsWith(CREATE_PREFIX));
    if (created) {
      const newName = created.slice(CREATE_PREFIX.length);
      setInstructors([
        ...next.filter((v) => !v.startsWith(CREATE_PREFIX)),
        newName,
      ]);
    } else {
      setInstructors(next);
    }
    setInstructorQuery("");
  };

  const isDuplicateCode =
    courseCode.trim().length > 0 &&
    courses.some(
      (c) => c.courseCode.toLowerCase() === courseCode.trim().toLowerCase(),
    );

  const canSave =
    courseCode.trim().length > 0 &&
    courseTitle.trim().length > 0 &&
    !isDuplicateCode;

  const resetForm = () => {
    setCourseCode("");
    setCourseTitle("");
    setInstructors([]);
    setInstructorQuery("");
  };

  const handleDialogOpenChange = (open: boolean) => {
    setAddDialogOpen(open);
    if (!open) resetForm();
  };

  const handleSaveCourse = () => {
    if (!canSave) return;
    setCourses([
      ...courses,
      {
        courseCode: courseCode.trim(),
        courseTitle: courseTitle.trim(),
        instructors,
      },
    ]);
    setAddDialogOpen(false);
    resetForm();
  };

  // ลบผู้สอนออกจากวิชานั้นทันที (กด X บน Badge ในตาราง)
  const handleRemoveInstructorFromCourse = (
    code: string,
    instructorName: string,
  ) => {
    setCourses(
      courses.map((c) =>
        c.courseCode === code
          ? {
              ...c,
              instructors: (c.instructors ?? []).filter(
                (i) => i !== instructorName,
              ),
            }
          : c,
      ),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">จัดการวิชาเรียน</h1>
          <p className="text-sm text-muted-foreground">
            {courses.length} วิชา — เพิ่ม/แก้ไข/ลบรายวิชาของหลักสูตรให้นักศึกษาลงทะเบียนได้ที่นี่
          </p>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={handleDialogOpenChange}>
          <DialogTrigger render={<Button />}>
            <PlusCircle className="h-4 w-4" />
            เพิ่มวิชา
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มวิชาใหม่</DialogTitle>
              <DialogDescription>
                วิชาที่เพิ่มจะไปโผล่เป็นตัวเลือกตอนลงทะเบียนให้นักศึกษาได้ทันที
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="courseCode">รหัสวิชา</Label>
                <Input
                  id="courseCode"
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  aria-invalid={isDuplicateCode}
                  className={cn(
                    isDuplicateCode &&
                      "border-destructive focus-visible:ring-destructive",
                  )}
                />
                {isDuplicateCode && (
                  <p className="text-sm text-destructive">
                    มีรหัสวิชา {courseCode.trim().toUpperCase()} นี้แล้ว
                  </p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="courseTitle">ชื่อวิชา</Label>
                <Input
                  id="courseTitle"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>ผู้สอน</Label>
                <Combobox
                  items={instructorItems}
                  multiple
                  value={instructors}
                  onValueChange={handleInstructorValueChange}
                  inputValue={instructorQuery}
                  onInputValueChange={setInstructorQuery}
                >
                  <ComboboxChips>
                    <ComboboxValue>
                      {instructors.map((name) => (
                        <ComboboxChip key={name}>{name}</ComboboxChip>
                      ))}
                    </ComboboxValue>
                    <ComboboxChipsInput placeholder="เลือกหรือพิมพ์ชื่อผู้สอน" />
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxEmpty>ไม่พบผู้สอน</ComboboxEmpty>
                    <ComboboxList>
                      {(item) => (
                        <ComboboxItem key={item} value={item}>
                          {item.startsWith(CREATE_PREFIX)
                            ? `+ เพิ่มผู้สอน "${item.slice(CREATE_PREFIX.length)}"`
                            : item}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
              </div>
            </div>

            <DialogFooter>
              <Button disabled={!canSave} onClick={handleSaveCourse}>
                บันทึก
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>รหัสวิชา</TableHead>
              <TableHead>ชื่อวิชา</TableHead>
              <TableHead>ผู้สอน</TableHead>
              <TableHead className="text-right">Action</TableHead>
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
            {courses.map((c) => (
              <TableRow key={c.courseCode}>
                <TableCell className="font-medium">{c.courseCode}</TableCell>
                <TableCell>{c.courseTitle}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {!c.instructors || c.instructors.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        ยังไม่มีผู้สอน
                      </span>
                    ) : (
                      c.instructors.map((name) => (
                        <Badge key={name} variant="secondary" className="gap-1">
                          {name}
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveInstructorFromCourse(
                                c.courseCode,
                                name,
                              )
                            }
                            className="rounded-full hover:bg-muted-foreground/20"
                            aria-label={`ลบผู้สอน ${name}`}
                          >
                            ×
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="ghost" size="icon" />}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>ยืนยันการลบวิชา</AlertDialogTitle>
                        <AlertDialogDescription>
                          ต้องการลบวิชา {c.courseCode} — {c.courseTitle}{" "}
                          ใช่ไหม? การลงทะเบียนของนักศึกษาที่ลงวิชานี้ไว้จะถูกลบไปด้วย
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => removeCourse(c.courseCode)}
                        >
                          ลบวิชา
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
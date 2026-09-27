// import { Link } from "react-router";

// import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-xl space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="text-xl font-bold">ระบบจัดการวิชาเรียนและสถานะนักศึกษา</span>
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* <Button render={<Link to="/admin/enrollments" />}>
            ไปหน้าจัดการการลงทะเบียน
          </Button> */}
        </CardContent>
      </Card>
    </div>
  );
}

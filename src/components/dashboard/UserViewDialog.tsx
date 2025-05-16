import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { User } from "@/types";

interface Props {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UserViewDialog({ user, open, onOpenChange }: Props) {
  const fieldList = [
    { label: "Username", value: user.username },
    { label: "Email", value: user.email },
    { label: "Phone", value: user.phone },
    { label: "Gender", value: user.gender },
    { label: "Date of Birth", value: user.dob ? new Date(user.dob).toLocaleDateString() : null },
    { label: "Location", value: user.location },
    { label: "Join Date", value: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : null },
    { label: "Role", value: user.role },
    { label: "Confirmed", value: user.isConfirmed ? "Yes" : "No" },
    { label: "Deleted", value: user.isDeleted ? "Yes" : "No" },
{ label: "Courses", value: Array.isArray(user.courses) ? user.courses.length.toString() : null }  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {fieldList.map(
            ({ label, value }) =>
              value && (
                <div key={label} className="flex justify-between border-b pb-1">
                  <span className="font-semibold">{label}:</span>
                  <span>{value}</span>
                </div>
              )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

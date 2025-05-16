import { useState, useEffect, useRef } from "react";
import { Plus, Trash2, Edit, Search, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useSelector, useDispatch } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  fetchAllInstructors,
  createInstructor,
  updateInstructor,
  deleteInstructor,
  selectAllInstructors,
  selectInstructorStatus,
  selectInstructorError,
} from "@/store/slices/instructorSlice";
import { Instructor } from "@/types";
import { useAppDispatch } from "@/hooks/use-AppDispatch";

export default function Instructors() {
  const dispatch = useAppDispatch();
  const instructors = useSelector(selectAllInstructors) as Instructor[];
  const status = useSelector(selectInstructorStatus);
  const error = useSelector(selectInstructorError);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentInstructor, setCurrentInstructor] = useState<Instructor | null>(null);
  const [instructorToDelete, setInstructorToDelete] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(fetchAllInstructors());
  }, [dispatch]);

  const filteredInstructors = instructors.filter((instructor) =>
    instructor.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentInstructor?.Name) return;

    const formData = new FormData();
    formData.append("Name", currentInstructor.Name);
    if (currentInstructor.job) {
      formData.append("job", currentInstructor.job);
    }
    if (currentInstructor.description) {
      formData.append("description", currentInstructor.description);
    }
    if (currentInstructor.SocialMedia?.LinkidIn) {
      formData.append("SocialMedia[LinkidIn]", currentInstructor.SocialMedia.LinkidIn);
    }
    if (imageFile) {
      formData.append("instructorImage", imageFile);
    }

    if (currentInstructor._id) {
      dispatch(
        updateInstructor({ id: currentInstructor._id, instructorData: formData })
      );
    } else {
      dispatch(createInstructor(formData));
    }

    setIsDialogOpen(false);
    setCurrentInstructor(null);
    handleRemoveImage();
  };

  const handleDelete = () => {
    if (instructorToDelete) {
      dispatch(deleteInstructor(instructorToDelete));
      setIsDeleteDialogOpen(false);
      setInstructorToDelete(null);
    }
  };

  if (status === "loading") {
    return (
      <DashboardLayout>
        <div className="p-4">Loading instructors...</div>
      </DashboardLayout>
    );
  }

  if (status === "failed") {
    return (
      <DashboardLayout>
        <div className="p-4 text-red-500">Error: {error as string}</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Instructors</h1>
          <Button
            className="bg-coursera-blue hover:bg-coursera-blue-dark"
            onClick={() => {
              setCurrentInstructor({
                Name: "",
                SocialMedia: {},
              });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Instructor
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search instructors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Job</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInstructors.length > 0 ? (
                filteredInstructors.map((instructor) => (
                  <TableRow key={instructor._id}>
                    <TableCell className="font-medium">
                      {instructor.Name}
                    </TableCell>
                    <TableCell>
                      {instructor.job || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentInstructor({
                              _id: instructor._id,
                              Name: instructor.Name,
                              job: instructor.job,
                              description: instructor.description,
                              SocialMedia: instructor.SocialMedia || {},
                              instructorImage: instructor.instructorImage
                            });
                            if (instructor.instructorImage) {
                              setImagePreview(instructor.instructorImage);
                            }
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setInstructorToDelete(instructor._id);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    No instructors found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Instructor Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {currentInstructor?._id ? "Edit Instructor" : "Add New Instructor"}
              </DialogTitle>
              <DialogDescription>
                {currentInstructor?._id
                  ? "Update the instructor details below."
                  : "Create a new instructor for your courses."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={currentInstructor?.Name || ""}
                    onChange={(e) =>
                      setCurrentInstructor((prev) => ({
                        ...prev!,
                        Name: e.target.value,
                      }))
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job">Job Title</Label>
                  <Input
                    id="job"
                    value={currentInstructor?.job || ""}
                    onChange={(e) =>
                      setCurrentInstructor((prev) => ({
                        ...prev!,
                        job: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={currentInstructor?.description || ""}
                    onChange={(e) =>
                      setCurrentInstructor((prev) => ({
                        ...prev!,
                        description: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Social Media</Label>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn</Label>
                      <Input
                        id="linkedin"
                        value={currentInstructor?.SocialMedia?.LinkidIn || ""}
                        onChange={(e) =>
                          setCurrentInstructor((prev) => ({
                            ...prev!,
                            SocialMedia: {
                              ...prev?.SocialMedia!,
                              LinkidIn: e.target.value,
                            },
                          }))
                        }
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Profile Image</Label>
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        ref={fileInputRef}
                      />
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={handleRemoveImage}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="mt-1">
                        <img
                          src={imagePreview}
                          alt="Instructor preview"
                          className="h-20 rounded-md object-cover border"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setCurrentInstructor(null);
                    handleRemoveImage();
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-coursera-blue hover:bg-coursera-blue-dark"
                >
                  {currentInstructor?._id ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                instructor and remove their data from our servers.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
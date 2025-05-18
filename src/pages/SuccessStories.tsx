// src/app/(dashboard)/success-stories/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, Search, Loader2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useSelector } from "react-redux";
import DashboardLayout from "@/components/layout/DashboardLayout";

import { SuccessStory } from "@/types";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { useAppDispatch } from "@/hooks/use-AppDispatch";
import {
  fetchSuccessStories,
  addSuccessStory,
  updateSuccessStory,
  deleteSuccessStory,
  selectAllSuccessStories,
  selectSuccessStoryStatus,
  selectSuccessStoryError,
} from "@/store/slices/SuccessStorySlice";

export default function SuccessStoriesPage() {
  const dispatch = useAppDispatch();
  const stories = useSelector(selectAllSuccessStories);
  const status = useSelector(selectSuccessStoryStatus);
  const error = useSelector(selectSuccessStoryError);
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentStory, setCurrentStory] =
    useState<Partial<SuccessStory> | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    dispatch(fetchSuccessStories());
  }, [dispatch]);

  const filteredStories = Array.isArray(stories)
    ? stories.filter(
        (story) =>
          story.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          story.certificateName
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStory) return;

    try {
      if (imageFile || !currentStory._id) {
        const formData = new FormData();
        formData.append("name", currentStory.name || "");
        formData.append("certificateName", currentStory.certificateName || "");
        formData.append("review", currentStory.review || "");
        formData.append(
          "date",
          currentStory.date || format(new Date(), "yyyy-MM-dd")
        );

        if (imageFile) {
          formData.append("personImage", imageFile);
        } else if (currentStory.personImage && !currentStory._id) {
          toast({
            title: "Error",
            description: "Image is required for new stories",
            variant: "destructive",
          });
          return;
        }

        if (currentStory._id) {
          await dispatch(
            updateSuccessStory({
              id: currentStory._id,
              storyData: formData,
            })
          ).unwrap();
        } else {
          await dispatch(addSuccessStory(formData)).unwrap();
        }
      } else {
        await dispatch(
          updateSuccessStory({
            id: currentStory._id,
            storyData: {
              name: currentStory.name,
              certificateName: currentStory.certificateName,
              review: currentStory.review,
              date: currentStory.date,
            },
          })
        ).unwrap();
      }

      setIsDialogOpen(false);
      setCurrentStory(null);
      setImageFile(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit story",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (storyToDelete) {
      try {
        await dispatch(deleteSuccessStory(storyToDelete)).unwrap();
        setIsDeleteDialogOpen(false);
        setStoryToDelete(null);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to delete story",
          variant: "destructive",
        });
      }
    }
  };

  if (status === "loading" && !stories.length) {
    return (
      <DashboardLayout>
        <div className="p-4">Loading success stories...</div>
      </DashboardLayout>
    );
  }

  
  // console.log(stories);

  return (
    <DashboardLayout>
      {status === "failed" && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline ml-2">
            {error || "Something went wrong."}
          </span>
        </div>
      )}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Success Stories</h1>
          <Button
            className="bg-coursera-blue hover:bg-coursera-blue-dark"
            onClick={() => {
              setCurrentStory({
                name: "",
                certificateName: "",
                review: "",
                date: format(new Date(), "yyyy-MM-dd"),
                personImage: "",
              });
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Story
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search stories..."
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
                <TableHead>Certificate</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStories.length > 0 ? (
                filteredStories.map((story) => (
                  <TableRow key={story._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {story.personImage && (
                          <img
                            src={story.personImage}
                            alt={story.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        {story.name}
                      </div>
                    </TableCell>
                    <TableCell>{story.certificateName}</TableCell>
                    <TableCell>
                      {format(new Date(story.date), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentStory({ ...story });
                            setIsDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setStoryToDelete(story._id);
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
                  <TableCell colSpan={4} className="text-center py-6">
                    No success stories found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add/Edit Story Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {currentStory?._id
                  ? "Edit Success Story"
                  : "Add New Success Story"}
              </DialogTitle>
              <DialogDescription>
                {currentStory?._id
                  ? "Update the success story details below."
                  : "Create a new success story to showcase."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Person Name *</Label>
                    <Input
                      id="name"
                      value={currentStory?.name || ""}
                      onChange={(e) =>
                        setCurrentStory((prev) => ({
                          ...prev!,
                          name: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="certificateName">Certificate Name *</Label>
                    <Input
                      id="certificateName"
                      value={currentStory?.certificateName || ""}
                      onChange={(e) =>
                        setCurrentStory((prev) => ({
                          ...prev!,
                          certificateName: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="review">Review *</Label>
                  <Textarea
                    id="review"
                    value={currentStory?.review || ""}
                    onChange={(e) =>
                      setCurrentStory((prev) => ({
                        ...prev!,
                        review: e.target.value,
                      }))
                    }
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={
                        currentStory?.date || format(new Date(), "yyyy-MM-dd")
                      }
                      onChange={(e) =>
                        setCurrentStory((prev) => ({
                          ...prev!,
                          date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personImage">
                      Person Image {!currentStory?._id && "*"}
                    </Label>
                    <Input
                      id="personImage"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                      required={!currentStory?._id}
                    />
                    {currentStory?._id && currentStory?.personImage && (
                      <p className="text-sm text-gray-500">
                        Current image will be kept if no new image is selected
                      </p>
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
                    setCurrentStory(null);
                    setImageFile(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-coursera-blue hover:bg-coursera-blue-dark"
                  disabled={status === "loading"}
                >
                  {status === "loading" ? (
                    <span className="flex items-center">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {currentStory?._id ? "Updating..." : "Creating..."}
                    </span>
                  ) : (
                    <span>{currentStory?._id ? "Update" : "Create"}</span>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the
                success story.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

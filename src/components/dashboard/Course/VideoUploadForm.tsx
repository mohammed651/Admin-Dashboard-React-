// components/VideoUploadForm.js
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { uploadVideoToCloudinary } from '@/lib/cloudinary';
import { Textarea } from '@/components/ui/textarea';

const VideoUploadForm = ({ topicId, onVideoUpload }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [discussion, setDiscussion] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    console.log('Form submitted');
    
    e.preventDefault();
    
    if (!file || !title || !transcript || !discussion) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
        console.log('Uploading video:', file);
        
    try {
      // Upload video to Cloudinary
      const videoData = await uploadVideoToCloudinary(file);

      // Prepare video object to save in your state or send to backend
      const newVideo = {
        title,
        videoUrl: videoData.url,
        cloudinaryId: videoData.publicId,
        transcript,
        discussion,
        duration: videoData.duration
      };

      // Call the callback function with the new video data
      onVideoUpload(newVideo);

      toast({
        title: 'Success',
        description: 'Video uploaded successfully',
        variant: 'success',
      });

      // Reset form
      setFile(null);
      setTitle('');
      setTranscript('');
      setDiscussion('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to upload video',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Upload New Video</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="video">Video File</Label>
          <Input
            id="video"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="transcript">Transcript</Label>
          <Textarea
            id="transcript"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            required
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="discussion">Discussion</Label>
          <Textarea
            id="discussion"
            value={discussion}
            onChange={(e) => setDiscussion(e.target.value)}
            required
            rows={3}
          />
        </div>

        <Button type="submit" disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload Video'}
        </Button>
      </form>
    </div>
  );
};

export default VideoUploadForm;
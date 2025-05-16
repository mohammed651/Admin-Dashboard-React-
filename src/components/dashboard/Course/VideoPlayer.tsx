import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { getVideoById } from "@/store/slices/videoSlice";
import { RootState } from "@/store/store";
import { useAppDispatch } from "@/hooks/use-AppDispatch";

interface VideoPlayerProps {
  id: any;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ id }) => {
  const dispatch = useAppDispatch();
  const { currentVideo: videoData, loading, error } = useSelector(
  (state: RootState) => state.video
);

  useEffect(() => {
    if (id) {
      // console.log("id"+id._id);
      dispatch(getVideoById(id._id));
    }
  }, [dispatch, id]);

  if (loading) return <p className="text-center py-4">Loading video...</p>;

  if (error)
    return (
      <p className="text-center text-red-600 py-4">
        Error: {typeof error === "string" ? error : "حدث خطأ غير متوقع"}
      </p>
    );

  if (!videoData) return <p className="text-center py-4">No video available.</p>;

  // console.log(videoData);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">{videoData.videoTitle}</h2>
      <video
        controls
        className="w-full rounded shadow-lg"
        preload="metadata"
        poster=""
      >
        <source src={videoData.url} type="video/mp4" />
        متصفحك لا يدعم تشغيل الفيديو.
      </video>
      <p className="mt-3 text-gray-700 whitespace-pre-wrap">
        {videoData.transeScript}
      </p>
    </div>
  );
};

export default VideoPlayer;
"use client";

import { useState, useEffect } from "react";
import { NotificationSheet } from "./notification-sheet";
import { PostDetailSheet, PostDetailData } from "./post-detail-sheet";
import { JokboDetailSheet } from "./jokbo-detail-sheet";
import { useToast } from "./toast";

export function NotificationListener() {
  const [show, setShow] = useState(false);
  const [selectedPost, setSelectedPost] = useState<PostDetailData | null>(null);
  const [selectedJokboId, setSelectedJokboId] = useState<string | null>(null);
  const { show: showToast } = useToast();

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener("header:notify", handler);
    return () => window.removeEventListener("header:notify", handler);
  }, []);

  return (
    <>
      {show && (
        <NotificationSheet
          onClose={() => setShow(false)}
          onOpenPost={(post) => setSelectedPost(post)}
          onOpenJokbo={(id) => setSelectedJokboId(id)}
        />
      )}

      {selectedPost && (
        <PostDetailSheet
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}

      {selectedJokboId && (
        <JokboDetailSheet
          templateId={selectedJokboId}
          onClose={() => setSelectedJokboId(null)}
          onError={() => { setSelectedJokboId(null); showToast("삭제된 족보예요"); }}
        />
      )}
    </>
  );
}

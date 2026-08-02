"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatWindow from "@/components/chat/ChatWindow";
import { Loader2 } from "lucide-react";

function ChatPageContent() {
  const searchParams = useSearchParams();
  const docIdParam = searchParams.get("document_id");
  const initialDocumentId = docIdParam ? parseInt(docIdParam, 10) : undefined;

  return <ChatWindow initialDocumentId={initialDocumentId} />;
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      }
    >
      <ChatPageContent />
    </Suspense>
  );
}

import { useMutation } from "@tanstack/react-query";

export const useUpload = () => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      // MVP: simulace upload flow
      console.log("📤 Starting upload process...");
      
      // 1. Upload ZIP a vytvoř listing v DB
      const uploadRes = await fetch("/api/upload/zip", { 
        method: "POST", 
        body: formData 
      });
      
      if (!uploadRes.ok) {
        const errorText = await uploadRes.text();
        console.error("❌ Upload failed:", uploadRes.status, errorText);
        let details = uploadRes.statusText;
        try {
          const errJson = JSON.parse(errorText);
          if (errJson.details) details = errJson.details;
          else if (errJson.error) details = errJson.error;
        } catch {
          if (errorText) details = errorText.slice(0, 200);
        }
        throw new Error(`Upload failed: ${details}`);
      }
      
      const uploadData = await uploadRes.json();
      console.log("✅ ZIP uploaded:", uploadData);

      // Batch: více ZIPů – API už vše vytvořilo a zařadilo
      if (uploadData.batch && Array.isArray(uploadData.results)) {
        return {
          batch: true as const,
          results: uploadData.results,
          count: uploadData.count ?? uploadData.results.length,
          message: uploadData.message ?? `Nahráno ${uploadData.results.length} ZIPů.`,
        };
      }

      const { listingId, zipUrl, jobId: uploadJobId, message: uploadMessage } = uploadData;

      if (!listingId || !zipUrl) {
        throw new Error("Missing listingId or zipUrl in response");
      }

      if (uploadJobId) {
        return {
          listingId,
          jobId: uploadJobId,
          message: uploadMessage || "Upload úspěšný. Zpracování začne brzy.",
        };
      }
      if (uploadMessage) {
        return { listingId, jobId: undefined, message: uploadMessage };
      }

      console.log(`🚀 Enqueueing job for listing ${listingId}...`);
      const queueRes = await fetch("/api/queue/process-zip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ listingId, zipUrl }),
      });

      if (!queueRes.ok) {
        const errorText = await queueRes.text();
        console.error("❌ Queue job failed:", queueRes.status, errorText);
        throw new Error(`Queue job failed: ${queueRes.statusText}`);
      }

      const queueData = await queueRes.json();
      console.log("✅ Job enqueued:", queueData);

      return {
        listingId,
        jobId: queueData.jobId,
        message: uploadMessage || queueData.message || "Upload úspěšný. Zpracování začne brzy.",
      };
    },
    onError: (error) => {
      console.error("Upload mutation error:", error);
    },
  });
};

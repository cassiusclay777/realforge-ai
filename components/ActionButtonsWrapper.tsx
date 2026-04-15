"use client";

import { useState } from "react";
import ActionButtons from "./ActionButtons";

interface ActionButtonsWrapperProps {
  listing: {
    title?: string;
    location?: string;
    price?: number;
    address?: string;
    type?: string;
    status?: string;
  };
  id: string;
  disabled?: boolean;
  aiResults?: {
    headline?: string;
    shortDesc?: string;
    longDesc?: string;
    bulletPoints?: string[];
    seoTitle?: string;
    seoDescription?: string;
    priceSuggestion?: number;
    targetAudience?: string;
  } | null;
}

export default function ActionButtonsWrapper({ listing, id, disabled = false, aiResults = null }: ActionButtonsWrapperProps) {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleExportToSreality = () => {
    setIsLoading("sreality");
    try {
      // Use AI generated title if available, otherwise fallback
      const title = aiResults?.headline || listing.title || "AI-Optimized Property Listing";
      const description = aiResults?.shortDesc || `Modern property in ${listing.location || "Prague"}`;
      const price = aiResults?.priceSuggestion || listing.price || 8500000;
      
      window.open(
        `https://www.sreality.cz/inzerat/novy?title=${encodeURIComponent(title)}&description=${encodeURIComponent(description)}&location=${encodeURIComponent(listing.location || "Prague")}&price=${price}`,
        '_blank',
        'noopener,noreferrer'
      );
    } catch (error) {
      console.error("Error opening Sreality:", error);
      alert("Failed to open Sreality. Please check your browser settings.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleShareSocial = () => {
    setIsLoading("social");
    try {
      // Use AI generated content for social sharing
      const title = aiResults?.headline || listing.title || "AI-Optimized Property";
      const description = aiResults?.shortDesc || `Check out this amazing property in ${listing.location || "Prague"}`;
      const shareText = `${title} - ${description}`;
      const shareUrl = window.location.href;
      
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
        '_blank',
        'width=600,height=400'
      );
    } catch (error) {
      console.error("Error sharing on social media:", error);
      alert("Failed to share on social media. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleExportPDF = () => {
    setIsLoading("pdf");
    try {
      alert('PDF export functionality will be implemented soon! For now, you can use the browser print function (Ctrl+P) to save as PDF.');
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleEmailCampaign = () => {
    setIsLoading("email");
    try {
      // Use AI generated content for email
      const title = aiResults?.headline || listing.title || "AI-Generated Property";
      const description = aiResults?.shortDesc || `Modern property in ${listing.location || "Prague"}`;
      const bulletPoints = aiResults?.bulletPoints?.join('\n• ') || "• Modern amenities\n• Great location\n• Investment potential";
      
      const subject = `AI-Optimized Property: ${title}`;
      const body = `Hello,\n\nI wanted to share this AI-optimized property listing with you:\n\n${title}\n\n${description}\n\nKey Features:\n• ${bulletPoints}\n\nLocation: ${listing.location || "Prague"}\nPrice: ${listing.price ? listing.price.toLocaleString('cs-CZ') + ' CZK' : 'Price upon request'}\n\nView the full AI-optimized listing here: ${window.location.href}\n\nBest regards,\nREALFORGE AI`;
      
      window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } catch (error) {
      console.error("Error starting email campaign:", error);
      alert("Failed to start email campaign. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleDownloadAll = () => {
    setIsLoading("download");
    try {
      const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050"}/api/export/zip/${id}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error("Error downloading files:", error);
      alert("Failed to download files. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handlePreviewWebsite = () => {
    setIsLoading("preview");
    try {
      window.open(`/preview/${id}`, '_blank');
    } catch (error) {
      console.error("Error previewing website:", error);
      alert("Failed to preview website. Please try again.");
    } finally {
      setIsLoading(null);
    }
  };

  const handleExportToPoski = async () => {
    setIsLoading("poski");
    try {
      console.log(`🚀 Starting Poski export for listing: ${id}`);
      
      const response = await fetch('/api/export/poski', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ listingId: id }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Failed to export to Poski');
      }

      // Show success toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-xl">✅</div>
          <div>
            <div class="font-bold">Successfully published to Poski!</div>
            <div class="text-sm opacity-90">Listing ID: ${result.poskiListingId || 'N/A'}</div>
          </div>
        </div>
      `;
      toast.style.animation = 'fadeIn 0.3s ease-in-out';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 5000);

      console.log('✅ Poski export successful:', result);
      
    } catch (error: any) {
      console.error('❌ Error exporting to Poski:', error);
      
      // Show error toast
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.innerHTML = `
        <div class="flex items-center gap-3">
          <div class="text-xl">❌</div>
          <div>
            <div class="font-bold">Failed to publish to Poski</div>
            <div class="text-sm opacity-90">${error.message || 'Unknown error'}</div>
          </div>
        </div>
      `;
      toast.style.animation = 'fadeIn 0.3s ease-in-out';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 5000);
    } finally {
      setIsLoading(null);
    }
  };

  const handleCopyLink = async () => {
    setIsLoading("copy");
    try {
      await navigator.clipboard.writeText(window.location.href);
      
      // Show a simple toast/notification
      const toast = document.createElement('div');
      toast.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
      toast.textContent = 'Link copied to clipboard!';
      toast.style.animation = 'fadeIn 0.3s ease-in-out';
      document.body.appendChild(toast);
      
      setTimeout(() => {
        if (toast.parentNode) {
          document.body.removeChild(toast);
        }
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      alert('Failed to copy link. Please copy it manually: ' + window.location.href);
    } finally {
      setIsLoading(null);
    }
  };

  // Add CSS for fade-in animation
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in {
        animation: fadeIn 0.3s ease-in-out;
      }
    `;
    if (!document.querySelector('style[data-toast-animation]')) {
      style.setAttribute('data-toast-animation', 'true');
      document.head.appendChild(style);
    }
  }

  return (
    <ActionButtons
      disabled={disabled || isLoading !== null}
      onExportToSreality={handleExportToSreality}
      onExportToPoski={handleExportToPoski}
      onShareSocial={handleShareSocial}
      onExportPDF={handleExportPDF}
      onEmailCampaign={handleEmailCampaign}
      onDownloadAll={handleDownloadAll}
      onPreviewWebsite={handlePreviewWebsite}
      onCopyLink={handleCopyLink}
    />
  );
}
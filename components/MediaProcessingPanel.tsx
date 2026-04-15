'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useListingMediaProcessing, MediaProcessingStatus } from '@/hooks/use-listing-media-processing';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Play, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

function LastUpdatedLabel({ lastUpdated }: Readonly<{ lastUpdated: string | null }>) {
  const [label, setLabel] = useState('');
  useEffect(() => {
    if (!lastUpdated) {
      setLabel('');
      return;
    }
    const update = () => {
      const sec = Math.floor((Date.now() - new Date(lastUpdated).getTime()) / 1000);
      if (sec < 60) setLabel(`${sec}s ago`);
      else if (sec < 3600) setLabel(`${Math.floor(sec / 60)}m ago`);
      else setLabel(`${Math.floor(sec / 3600)}h ago`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
    // Záměrně bez lastUpdated v deps: interval pouze aktualizuje label, nepotřebuje znovu běžet při změně lastUpdated
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdated]);
  if (!lastUpdated) return null;
  return <span className="text-xs text-muted-foreground">Last updated: {label}</span>;
}

interface MediaProcessingPanelProps {
  listingId: string;
  className?: string;
  showMediaPreview?: boolean;
  autoStartPolling?: boolean;
  onProcessingComplete?: () => void;
}

const statusConfig: Record<MediaProcessingStatus, {
  label: string;
  color: 'default' | 'secondary' | 'destructive' | 'outline';
  icon: React.ReactNode;
  description: string;
}> = {
  IDLE: {
    label: 'Ready',
    color: 'outline',
    icon: <Clock className="h-4 w-4" />,
    description: 'Media processing is ready to start',
  },
  QUEUED: {
    label: 'Queued',
    color: 'secondary',
    icon: <Clock className="h-4 w-4" />,
    description: 'Waiting in queue for processing',
  },
  PROCESSING: {
    label: 'Processing',
    color: 'secondary',
    icon: <RefreshCw className="h-4 w-4 animate-spin" />,
    description: 'AI is analyzing media files',
  },
  DONE: {
    label: 'Complete',
    color: 'default',
    icon: <CheckCircle className="h-4 w-4" />,
    description: 'All media processed successfully',
  },
  FAILED: {
    label: 'Failed',
    color: 'destructive',
    icon: <XCircle className="h-4 w-4" />,
    description: 'Processing failed, please retry',
  },
  PARTIAL: {
    label: 'Partial',
    color: 'secondary',
    icon: <AlertCircle className="h-4 w-4" />,
    description: 'Some media processed, some failed',
  },
};

export function MediaProcessingPanel({
  listingId,
  className = '',
  showMediaPreview = true,
  autoStartPolling = true,
  onProcessingComplete,
}: Readonly<MediaProcessingPanelProps>) {
  const router = useRouter();
  const {
    state,
    isLoading,
    error,
    isPolling,
    refresh,
    startProcessing,
    canStartProcessing,
    isProcessingActive,
    isProcessingComplete,
    isProcessingFailed,
    status,
    progress,
    totalMedia,
    processedMedia,
    media,
  } = useListingMediaProcessing(listingId, {
    enabled: autoStartPolling,
    onStatusChange: (newStatus) => {
      if (newStatus === 'DONE') {
        onProcessingComplete?.();
        router.refresh();
      }
    },
  });

  const statusConfigItem = statusConfig[status];
  const hasMedia = totalMedia > 0;

  const handleStartProcessing = async () => {
    try {
      await startProcessing();
    } catch (err) {
      console.error('Failed to start processing:', err);
    }
  };

  const handleRefresh = () => {
    refresh();
  };

  // Render media preview
  const renderMediaPreview = () => {
    if (!showMediaPreview || media.length === 0) {
      return null;
    }

    const processedMediaItems = media.filter(m => m.status === 'DONE');
    const unprocessedMediaItems = media.filter(m => m.status !== 'DONE');

    return (
      <div className="mt-6">
        <h4 className="text-sm font-medium mb-3">Media Preview</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {processedMediaItems.slice(0, 8).map((item) => (
            <div key={item.id} className="relative group">
              <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                {item.url && !item.url.includes('placeholder') ? (
                  <img
                    src={item.url}
                    alt={item.aiDescription || 'Processed media'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted">
                    <span className="text-muted-foreground text-xs">Processing...</span>
                  </div>
                )}
              </div>
              {item.isFeatured && (
                <Badge className="absolute top-1 left-1 text-xs" variant="secondary">
                  Featured
                </Badge>
              )}
              {item.aiCaption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.aiCaption}
                </div>
              )}
            </div>
          ))}
          
          {unprocessedMediaItems.length > 0 && (
            <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-sm">+{unprocessedMediaItems.length}</div>
                <div className="text-xs">Pending</div>
              </div>
            </div>
          )}
        </div>
        
        {processedMediaItems.length > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            {processedMediaItems.length} of {totalMedia} media files processed
            {(state?.statusCounts.FAILED ?? 0) > 0 &&
              `, ${state?.statusCounts.FAILED ?? 0} failed`}
          </div>
        )}
      </div>
    );
  };

  // Render status details
  const renderStatusDetails = () => {
    if (!state) return null;

    return (
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">{progress}%</span>
        </div>

        <Progress value={progress} className="h-2" />

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span>Done: {state.statusCounts.DONE}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary/60" />
            <span>Processing: {state.statusCounts.PROCESSING}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span>Queued: {state.statusCounts.QUEUED}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <span>Failed: {state.statusCounts.FAILED}</span>
          </div>
        </div>

        <div className="mt-2">
          <LastUpdatedLabel lastUpdated={state.lastUpdated} />
        </div>
      </div>
    );
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {statusConfigItem.icon}
              Media Processing
            </CardTitle>
            <CardDescription>
              {statusConfigItem.description}
            </CardDescription>
          </div>
          <Badge variant={statusConfigItem.color}>
            {statusConfigItem.label}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-center text-destructive">
              <AlertCircle className="h-4 w-4 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}
        
        {!hasMedia && status === 'IDLE' && (
          <div className="text-center py-6 text-muted-foreground">
            <p>No media files found for this listing.</p>
            <p className="text-sm mt-1">Upload media to start AI processing.</p>
          </div>
        )}
        
        {hasMedia && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-2xl font-bold">{processedMedia}/{totalMedia}</div>
                <div className="text-sm text-muted-foreground">Media files processed</div>
              </div>
              
              <div className="flex items-center gap-2">
                {isPolling && (
                  <div className="flex items-center text-sm text-primary">
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Live updating
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>
            
            {renderStatusDetails()}
          </>
        )}
        
        {renderMediaPreview()}
      </CardContent>
      
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        {canStartProcessing && hasMedia && (
          <Button
            onClick={handleStartProcessing}
            disabled={isLoading || !hasMedia}
            className="w-full sm:w-auto"
          >
            <Play className="h-4 w-4 mr-2" />
            Start AI Processing
          </Button>
        )}
        
        {isProcessingActive && (
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isPolling ? 'animate-spin' : ''}`} />
            {isPolling ? 'Live Updating' : 'Check Status'}
          </Button>
        )}
        
        {isProcessingFailed && (
          <Button
            variant="destructive"
            onClick={handleStartProcessing}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Processing
          </Button>
        )}
        
        {isProcessingComplete && (
          <div className="text-sm text-primary flex items-center">
            <CheckCircle className="h-4 w-4 mr-2" />
            All media processed successfully
          </div>
        )}

        <div className="text-xs text-muted-foreground mt-2 sm:mt-0 sm:ml-auto">
          {isPolling ? 'Auto-refresh every 3s' : 'Click refresh to check status'}
        </div>
      </CardFooter>
    </Card>
  );
}

// Simplified version for inline use
export function MediaProcessingStatusBadge({ listingId }: Readonly<{ listingId: string }>) {
  const { status, isLoading } = useListingMediaProcessing(listingId, {
    enabled: true,
    pollingInterval: 5000,
  });

  const statusConfigItem = statusConfig[status];

  return (
    <Badge variant={statusConfigItem.color} className="flex items-center gap-1">
      {isLoading ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : (
        statusConfigItem.icon
      )}
      {statusConfigItem.label}
    </Badge>
  );
}
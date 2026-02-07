interface NetworkIndicatorProps {
  connected?: boolean;
}

export default function NetworkIndicator({ connected = true }: NetworkIndicatorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-[7px] font-pixel px-2 py-1 border ${
      connected 
        ? "border-success/30 text-success/80 bg-success/5" 
        : "border-destructive/30 text-destructive bg-destructive/5"
    }`}>
      <span className={`inline-block h-1.5 w-1.5 ${connected ? "bg-success animate-pulse" : "bg-destructive"}`} />
      {connected ? "Base" : "Wrong Net"}
    </div>
  );
}

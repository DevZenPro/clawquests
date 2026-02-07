interface NetworkIndicatorProps {
  connected?: boolean;
}

export default function NetworkIndicator({ connected = true }: NetworkIndicatorProps) {
  return (
    <div className={`flex items-center gap-1.5 text-[7px] font-pixel px-2 py-1 border ${
      connected 
        ? "border-success/40 text-success bg-success/10" 
        : "border-destructive/40 text-destructive bg-destructive/10"
    }`}>
      <span className={`inline-block h-1.5 w-1.5 ${connected ? "bg-success" : "bg-destructive"}`} />
      {connected ? "Base" : "Wrong Network"}
    </div>
  );
}

import EmptyState from "./EmptyState";

export default function ErrorState({ message, onRetry }) {
  return (
    <EmptyState
      icon="cloud-offline-outline"
      title="Something went wrong"
      message={message || "We couldn't load the content. Check your connection and try again."}
      actionLabel="Try Again"
      onAction={onRetry}
    />
  );
}
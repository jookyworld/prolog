import WorkoutHistoryList from "@/components/WorkoutHistoryList";

export default function HistoryTabScreen() {
  return <WorkoutHistoryList showBackButton={false} detailRoutePath="/(tabs)/history" />;
}

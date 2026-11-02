import type { Metadata } from "next";
import MoveOutForm from "./MoveOutForm";

export const metadata: Metadata = {
  title: "Move-Out Condition Report — The Last Resort Lodge",
  description:
    "Joint move-out walk-through record and security deposit reconciliation for The Last Resort Lodge, New Meadows, Idaho.",
  robots: { index: false, follow: false },
};

export default function MoveOutPage() {
  return <MoveOutForm />;
}

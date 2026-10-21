"use client";

import dynamic from "next/dynamic";

const FishingMap = dynamic(() => import("./FishingMap"), { ssr: false });

interface Spot {
  name: string;
  lat: number;
  lng: number;
  type: string;
  desc: string;
}

export default function FishingMapLoader({ spots }: { spots: Spot[] }) {
  return <FishingMap spots={spots} />;
}

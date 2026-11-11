import { useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import markup from "../plate.html?raw";
import { bindPlate } from "../plate-client";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    return bindPlate(node);
  }, []);
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: markup }} />;
}

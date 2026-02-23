"use client";

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

interface Slide {
  src: string;
  alt?: string;
}

interface LightboxViewerProps {
  slides: Slide[];
  index: number;
  onClose: () => void;
}

export default function LightboxViewer({ slides, index, onClose }: LightboxViewerProps) {
  return (
    <Lightbox
      open={index >= 0}
      close={onClose}
      index={index}
      slides={slides}
    />
  );
}

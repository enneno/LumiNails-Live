import React from "react";
export default function Image({
  fill,
  priority,
  quality,
  unoptimized,
  sizes,
  style,
  ...props
}: any) {
  return (
    <img
      {...props}
      sizes={sizes}
      loading={priority ? "eager" : props.loading || "lazy"}
      style={
        fill
          ? {
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              ...style,
            }
          : style
      }
    />
  );
}

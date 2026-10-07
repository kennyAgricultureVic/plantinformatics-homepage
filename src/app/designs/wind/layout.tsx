import type { ReactNode } from "react";
import { Epilogue } from "next/font/google";
import "./wind.css";

// Epilogue: a wide, heavy grotesque that holds its shape at poster sizes and stays plain in text,
// so the field and the wind carry the drawing.
const epilogue = Epilogue({ subsets: ["latin"], variable: "--font-wind" });

export default function WindLayout({ children }: { children: ReactNode }) {
  return <div className={`${epilogue.variable} flex min-h-full flex-1 flex-col font-(family-name:--font-wind)`}>{children}</div>;
}

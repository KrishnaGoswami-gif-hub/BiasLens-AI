declare module 'html2canvas' {
  export default function html2canvas(
    element: HTMLElement,
    options?: Partial<{
      scale: number;
      backgroundColor: string;
      logging: boolean;
      useCORS: boolean;
    }>
  ): Promise<HTMLCanvasElement>;
}

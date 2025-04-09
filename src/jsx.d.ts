declare namespace JSX {
  interface IntrinsicElements {
    [key: string]: any;
  }

  interface Element {
    type: string;
    props: Record<string, any>;
    children: any[];
  }
}

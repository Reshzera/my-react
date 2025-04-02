declare namespace JSX {
  interface IntrinsicElements {
    div: any;
    h1: any;
    p: any;
    button: any;
    span: any;
    input: any;
  }

  interface Element {
    type: string;
    props: Record<string, any>;
    children: any[];
  }
}

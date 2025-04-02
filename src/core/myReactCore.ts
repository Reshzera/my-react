export type ElementType = string | FunctionComponent;

export interface NodeProps {
  [key: string]: any;
  children?: VirtualNode[];
}

export interface VirtualNode {
  type: ElementType;
  props: NodeProps;
}

export type FunctionComponent = (props: NodeProps) => VirtualNode;

export const MyReact = {
  createElement(
    type: ElementType,
    props: NodeProps,
    ...children: any[]
  ): VirtualNode {
    return {
      type,
      props: {
        ...props,
        children: children
          .flat()
          .map((child) =>
            typeof child === "object" ? child : createTextElement(String(child))
          ),
      },
    };
  },

  Fragment: (props: NodeProps) => props.children,
};

function createTextElement(text: string): VirtualNode {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

export function render(element: VirtualNode, container: HTMLElement) {
  const dom =
    typeof element.type !== "string"
      ? null
      : element.type === "TEXT_ELEMENT"
      ? document.createTextNode(element.props.nodeValue)
      : document.createElement(element.type);

  if (dom) {
    Object.entries(element.props || {})
      .filter(([key]) => key !== "children")
      .forEach(([name, value]) => {
        (dom as any)[name] = value;
      });

    element.props.children?.forEach((child) => {
      render(child, dom as HTMLElement);
    });

    container.appendChild(dom);
  } else if (typeof element.type === "function") {
    render((element.type as FunctionComponent)(element.props), container);
  }
}

export type ElementType = string | FunctionComponent;

export interface NodeProps {
  [key: string]: any;
  children?: VirtualNode[];
}

export interface VirtualNode {
  type: ElementType;
  props: NodeProps;
  dom?: HTMLElement | Text;
}

export type FunctionComponent = (props: NodeProps) => VirtualNode;

let currentComponent: Function | null = null;
const states: Map<Function, any[]> = new Map();
const stateSetters: Map<Function, number[]> = new Map();
let reRenderScheduled = false;

export const MyReact = {
  createElement(
    type: ElementType,
    props: NodeProps = {},
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

let rootContainer: HTMLElement | null = null;
let rootElement: VirtualNode | null = null;

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
  rootContainer = container;
  rootElement = element;

  container.innerHTML = "";

  const dom = createDom(element);
  container.appendChild(dom);
}

function createDom(element: VirtualNode): HTMLElement | Text {
  if (typeof element.type === "function") {
    currentComponent = element.type;

    if (!stateSetters.get(currentComponent)) {
      stateSetters.set(currentComponent, []);
    }

    if (stateSetters.get(currentComponent)) {
      stateSetters.get(currentComponent)!.length = 0;
    }

    const result = (element.type as FunctionComponent)(element.props);

    currentComponent = null;

    return createDom(result);
  }

  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type as string);

  updateDomProperties(dom, {}, element.props);

  element.props.children?.forEach((child) => {
    const childDom = createDom(child);
    dom.appendChild(childDom);
  });

  element.dom = dom;

  return dom;
}

function updateDomProperties(
  dom: HTMLElement | Text,
  oldProps: NodeProps,
  newProps: NodeProps
) {
  const isEvent = (name: string) => name.startsWith("on");
  const isProperty = (name: string) => name !== "children" && !isEvent(name);

  Object.keys(oldProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, oldProps[name]);
    });

  Object.keys(oldProps)
    .filter(isProperty)
    .forEach((name) => {
      (dom as any)[name] = "";
    });

  Object.keys(newProps)
    .filter(isProperty)
    .forEach((name) => {
      (dom as any)[name] = newProps[name];
    });

  Object.keys(newProps)
    .filter(isEvent)
    .forEach((name) => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, newProps[name]);
    });
}

export function useState<T>(initialValue: T): [T, (newValue: T) => void] {
  if (!currentComponent) {
    throw new Error("useState can only be called inside a component");
  }

  const component = currentComponent;

  if (!states.has(component)) {
    states.set(component, []);
    stateSetters.set(component, []);
  }

  const componentStates = states.get(component)!;
  const componentSetterIds = stateSetters.get(component)!;

  const stateIndex = componentSetterIds.length;

  if (stateIndex >= componentStates.length) {
    componentStates.push(initialValue);
  }

  const setState = (newValue: T) => {
    const currentStates = states.get(component);
    if (currentStates && currentStates[stateIndex] !== newValue) {
      currentStates[stateIndex] = newValue;
      scheduleRerender();
    }
  };

  componentSetterIds.push(stateIndex);

  return [componentStates[stateIndex], setState];
}

function scheduleRerender() {
  if (!reRenderScheduled && rootContainer && rootElement) {
    reRenderScheduled = true;

    setTimeout(() => {
      if (rootContainer && rootElement) {
        render(rootElement, rootContainer);
        reRenderScheduled = false;
      }
    }, 0);
  }
}

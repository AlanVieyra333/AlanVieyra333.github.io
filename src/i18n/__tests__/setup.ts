import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

/**
 * Mock de `framer-motion` para tests.
 *
 * En jsdom, framer-motion intenta adjuntar listeners de resize y
 * crear `ProjectionNode`s sobre el `document`. En jsdom, el
 * `document` real sí expone `addEventListener`, pero los elementos
 * que framer-motion crea para animar (los `VisualElement`s internos)
 * no lo hacen de forma fiable y los tests se rompen con
 * "target.addEventListener is not a function".
 *
 * Lo más limpio para tests es tratar los componentes `motion.X`
 * como elementos HTML estáticos. Mantenemos `AnimatePresence`,
 * `useReducedMotion` y `MotionConfig` para que el código que
 * sólo los consume no se rompa al importar.
 */
vi.mock('framer-motion', async () => {
  const React = await import('react');

  type MotionProxy = HTMLDivElement & Record<string, unknown>;

  const passthrough = (tag: string) => {
    const Component = React.forwardRef<
      HTMLElement,
      Record<string, unknown>
    >((props, ref) => {
      const {
        initial: _initial,
        animate: _animate,
        exit: _exit,
        transition: _transition,
        variants: _variants,
        whileInView: _whileInView,
        whileHover: _whileHover,
        whileTap: _whileTap,
        whileFocus: _whileFocus,
        whileDrag: _whileDrag,
        layout: _layout,
        layoutId: _layoutId,
        drag: _drag,
        dragConstraints: _dragConstraints,
        onAnimationStart: _a,
        onAnimationEnd: _b,
        onAnimationIteration: _c,
        onDragStart: _d,
        onDragEnd: _e,
        onDrag: _f,
        ...rest
      } = props;
      void _initial; void _animate; void _exit; void _transition;
      void _variants; void _whileInView; void _whileHover;
      void _whileTap; void _whileFocus; void _whileDrag;
      void _layout; void _layoutId; void _drag; void _dragConstraints;
      void _a; void _b; void _c; void _d; void _e; void _f;
      return React.createElement(tag, { ...rest, ref });
    });
    Component.displayName = `motion.${tag}`;
    return Component;
  };

  const motion = new Proxy({} as MotionProxy, {
    get: (_target, prop: string) => passthrough(prop),
  });

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    MotionConfig: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
    useReducedMotion: () => true,
    useMotionValue: (initial: unknown) => ({ current: initial, get: () => initial, set: () => undefined }),
    useTransform: () => ({ current: 0, get: () => 0, set: () => undefined }),
    useSpring: () => ({ current: 0, get: () => 0, set: () => undefined }),
  };
});

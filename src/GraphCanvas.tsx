import React, {
  FC,
  forwardRef,
  Ref,
  Suspense,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from 'react';
import { Canvas } from '@react-three/fiber';
import { GraphScene, GraphSceneProps, GraphSceneRef } from './GraphScene';
import {
  CameraMode,
  CameraControls,
  CameraControlsRef
} from './CameraControls';
import { Theme, lightTheme } from './utils';
import { createStore, Provider } from './store';
import css from './GraphCanvas.module.css';

export interface GraphCanvasProps extends Omit<GraphSceneProps, 'theme'> {
  /**
   * Theme to use for the graph.
   */
  theme?: Theme;

  /**
   * Type of camera interaction.
   */
  cameraMode?: CameraMode;

  /**
   * When the canvas was clicked but didn't hit a node/edge.
   */
  onCanvasClick?: (event: MouseEvent) => void;
}

export type GraphCanvasRef = Omit<GraphSceneRef, 'graph'> &
  Omit<CameraControlsRef, 'controls'> & {
    getGraph: () => any;
    getControls: () => any;
  };

export const GraphCanvas: FC<GraphCanvasProps & { ref?: Ref<GraphCanvasRef> }> =
  forwardRef(
    (
      { cameraMode, theme, onCanvasClick, animated, disabled, ...rest },
      ref: Ref<GraphCanvasRef>
    ) => {
      const [canvasContainer, setCanvasContainer] = useState<DOMRect>();
      const canvasRef = useRef<HTMLCanvasElement>();
      const rendererRef = useRef<GraphSceneRef | null>(null);
      const controlsRef = useRef<CameraControlsRef | null>(null);

      useImperativeHandle(ref, () => ({
        centerGraph: (n?: string[]) => rendererRef.current?.centerGraph(n),
        zoomIn: () => controlsRef.current?.zoomIn(),
        zoomOut: () => controlsRef.current?.zoomOut(),
        panLeft: () => controlsRef.current?.panLeft(),
        panRight: () => controlsRef.current?.panRight(),
        panDown: () => controlsRef.current?.panDown(),
        panUp: () => controlsRef.current?.panUp(),
        getControls: () => controlsRef.current?.controls,
        getGraph: () => rendererRef.current?.graph
      }));

      useEffect(() => {
        setCanvasContainer(canvasRef?.current?.getBoundingClientRect());
      }, []);

      return (
        <div className={css.canvas}>
          <Canvas
            ref={canvasRef}
            gl={{ alpha: true, antialias: true }}
            camera={{ position: [0, 0, 1000], near: 5, far: 10000, fov: 10 }}
            onPointerMissed={onCanvasClick}
          >
            <color attach="background" args={[theme.canvas.background]} />
            <ambientLight intensity={0.5} />
            <fog attach="fog" args={[theme.canvas.fog, 4000, 9000]} />
            <CameraControls
              mode={cameraMode}
              ref={controlsRef}
              animated={animated}
              disabled={disabled}
            >
              <Suspense>
                <Provider createStore={createStore}>
                  <GraphScene
                    ref={rendererRef as any}
                    theme={theme}
                    disabled={disabled}
                    animated={animated}
                    canvasContainer={canvasContainer}
                    {...rest}
                  />
                </Provider>
              </Suspense>
            </CameraControls>
          </Canvas>
        </div>
      );
    }
  );

GraphCanvas.defaultProps = {
  cameraMode: 'pan',
  layoutType: 'forceDirected2d',
  sizingType: 'none',
  labelType: 'auto',
  theme: lightTheme,
  animated: true
};

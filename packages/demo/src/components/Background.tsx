/* eslint-disable @next/next/no-img-element */

import { Camera, CameraOff, Pause, Play } from "lucide-react";
import {
  Component,
  createRef,
  HTMLAttributes,
  ReactNode,
  RefObject,
} from "react";

export type RandomWalkProps = HTMLAttributes<HTMLDivElement> & {
  x?: number;
  y?: number;
  stopped: boolean;
};

export class RandomWalk extends Component<RandomWalkProps> {
  // position, speed, force
  physics: number[] = [0, 0, 0, 0, 0, 0];
  ref: RefObject<HTMLDivElement> = createRef();
  interval: ReturnType<typeof setInterval> | undefined = undefined;

  x: number = 0;
  y: number = 0;

  startLoop() {
    clearInterval(this.interval);
    this.interval = setInterval(() => {
      if (!this.ref.current) {
        return;
      }

      const randomAngle = Math.random() * 2 * Math.PI;
      const rx = Math.cos(randomAngle) * 0.04;
      const ry = Math.sin(randomAngle) * 0.04;

      const physics = this.physics;
      const [x, y, vx, vy, fx, fy] = physics;

      const dx = (this.props.x ?? this.x) - x;
      const dy = (this.props.y ?? this.y) - y;

      const fSquare = fx * fx + fy * fy;
      if (fSquare > 0.64) {
        const f = Math.sqrt(fSquare);
        physics[4] *= 0.8 / f;
        physics[5] *= 0.8 / f;
      }

      physics[0] += vx * 0.08;
      physics[1] += vy * 0.08;
      physics[2] = vx * 0.8 + fx + dx * 0.08;
      physics[3] = vy * 0.8 + fy + dy * 0.08;
      physics[4] += rx;
      physics[5] += ry;

      this.ref.current.style.transform = `translate(${x}px, ${y}px)`;
    }, 16);
  }

  componentDidMount(): void {
    this.startLoop();
  }

  componentWillUnmount(): void {
    clearInterval(this.interval);
  }

  componentDidUpdate(): void {
    if (this.props.stopped) {
      clearInterval(this.interval);
    } else {
      this.startLoop();
    }
  }

  render(): ReactNode {
    return (
      <div {...{ ...this.props, stopped: undefined }} ref={this.ref}>
        {this.props.children}
      </div>
    );
  }
}

export class Background extends Component {
  refBg: RefObject<HTMLDivElement> = createRef();
  ref0: RefObject<RandomWalk> = createRef();
  ref1: RefObject<RandomWalk> = createRef();
  ref2: RefObject<RandomWalk> = createRef();

  state = {
    stopped: false,
    lifted: false,
  };

  handler = (e: MouseEvent) => {
    if (
      !this.refBg.current ||
      !this.ref0.current ||
      !this.ref1.current ||
      !this.ref2.current
    ) {
      return;
    }

    const { clientX: x, clientY: y } = e;
    const dx = x - this.refBg.current.clientWidth / 2;
    const dy = y - this.refBg.current.clientHeight / 2;

    this.ref0.current.x = dx * 0.2;
    this.ref0.current.y = dy * 0.2;
    this.ref1.current.x = dx * 0.08;
    this.ref1.current.y = dy * 0.08;
    this.ref2.current.x = dx * 0.03;
    this.ref2.current.y = dy * 0.03;
  };

  componentDidMount(): void {
    document.removeEventListener("mousemove", this.handler);
    document.addEventListener("mousemove", this.handler);
  }

  componentWillUnmount(): void {
    document.removeEventListener("mousemove", this.handler);
  }

  render(): ReactNode {
    const { stopped, lifted } = this.state;

    return (
      <>
        <div
          className="fixed left-0 top-0 h-full w-full bg-white"
          ref={this.refBg}
          style={{ zIndex: lifted ? 40 : -100 }}
        >
          <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
            <RandomWalk
              ref={this.ref0}
              className="flex flex-col items-center"
              stopped={stopped}
            >
              <div className="relative">
                <img
                  style={{
                    width: "min(60vw, 60vh)",
                    maxWidth: "none",
                  }}
                  src="./background/0.svg"
                  alt=""
                />
                <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
                  <RandomWalk ref={this.ref1} stopped={stopped}>
                    <img
                      style={{
                        width: "min(60vw, 60vh)",
                        maxWidth: "none",
                      }}
                      src="./background/1.svg"
                      alt=""
                    />
                    <div className="absolute left-1/2 top-1/2 translate-x-[-50%] translate-y-[-50%]">
                      <RandomWalk ref={this.ref2} stopped={stopped}>
                        <img
                          style={{
                            width: "min(60vw, 60vh)",
                            maxWidth: "none",
                          }}
                          src="./background/2.svg"
                          alt=""
                        />
                      </RandomWalk>
                    </div>
                  </RandomWalk>
                </div>
              </div>
              <div className="flex">
                {"CCC".split("").map((c, i) => (
                  <RandomWalk
                    x={0}
                    y={0}
                    className="mx-2 mt-6 text-7xl font-bold"
                    stopped={stopped}
                    key={i}
                  >
                    {c}
                  </RandomWalk>
                ))}
              </div>
            </RandomWalk>
          </div>
          {this.state.lifted ? undefined : (
            <div className="absolute left-0 top-0 h-full w-full bg-white opacity-70"></div>
          )}
        </div>
        {this.state.stopped ? (
          <Play
            fill="black"
            className="fixed bottom-4 left-4 z-50 h-8 w-8 cursor-pointer"
            onClick={() => this.setState({ stopped: false })}
          />
        ) : (
          <Pause
            fill="black"
            className="fixed bottom-4 left-4 z-50 h-8 w-8 cursor-pointer"
            onClick={() => this.setState({ stopped: true })}
          />
        )}
        {this.state.lifted ? (
          <CameraOff
            className="fixed bottom-4 left-16 z-50 h-8 w-8 cursor-pointer"
            onClick={() => this.setState({ lifted: false })}
          />
        ) : (
          <Camera
            className="fixed bottom-4 left-16 z-50 h-8 w-8 cursor-pointer"
            onClick={() => this.setState({ lifted: true })}
          />
        )}
      </>
    );
  }
}

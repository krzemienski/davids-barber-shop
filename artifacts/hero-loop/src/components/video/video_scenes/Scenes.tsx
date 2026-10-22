import { PlateScene } from './PlateScene';

export function ChairScene() {
  return <PlateScene img="hero-poster.jpg" dur={4000} from={{ s: 1.1, x: 0 }} to={{ s: 1.18, x: -2 }} steam glintAt={1.6} />;
}
export function ToolsScene() {
  return <PlateScene img="tools.jpg" dur={4000} from={{ s: 1.25, x: 1, r: 1.5 }} to={{ s: 1.12, x: -1, r: 0 }} glintAt={1.0} />;
}
export function RoomScene() {
  return <PlateScene img="interior.jpg" dur={4000} origin="60% 45%" from={{ s: 1.08, x: 2 }} to={{ s: 1.16, x: -2 }} glintAt={1.2} />;
}
export function TowelScene() {
  return <PlateScene img="towel.jpg" dur={4000} from={{ s: 1.12, x: 1 }} to={{ s: 1.22, x: -1 }} steam glintAt={0.9} />;
}

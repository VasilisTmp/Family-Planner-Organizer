import {EffectBackHandler} from '../utils';

interface Props {
  action: Function;
}

export default function GhostBackHandler({action}: Props) {
  EffectBackHandler(action);
  return <></>;
}

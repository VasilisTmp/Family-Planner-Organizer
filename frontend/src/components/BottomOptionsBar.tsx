import colors from '../config/colors';
import OptionsBar from './OptionsBar';

interface Props {
  children?: React.ReactNode;
}

export default function BottomOptionsBar({children}: Props) {
  return (
    <OptionsBar
      style={{
        backgroundColor: `rgba(${colors.backgroundTrans},0.95)`,
        borderBottomWidth: 0,
        borderTopColor: colors.tertiary,
        borderTopWidth: 1,
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
      }}>
      {children}
    </OptionsBar>
  );
}

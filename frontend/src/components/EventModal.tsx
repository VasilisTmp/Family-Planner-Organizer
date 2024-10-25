import {useMyStore} from '../../store';
import {_deleteEventGroup, _updateDoneEventGroup} from '../api/Groups';
import colors from '../config/colors';
import {groupEventsType} from '../config/types';
import socket from '../utils/socket';
import {OptionWithIcon} from './Option';
import OptionsModal from './OptionsModal';

interface Props {
  event: groupEventsType;
  visible: boolean;
  close: Function;
  openModal2: Function;
  openConfirmModal: Function;
}

export default function EventModal({
  event,
  close,
  visible,
  openModal2,
  openConfirmModal,
}: Props) {
  const {userId, groupId, toggleLoading, members} = useMyStore();

  async function updateDoneEventGroup() {
    toggleLoading(true);
    await _updateDoneEventGroup(groupId, event._id, !event.done);
    event.done = !event.done;
    const nickname = members.find(m => m.userId === userId)?.nickname || '';
    const forNickname =
      members.find(m => m.userId === event.forId)?.nickname || '';
    socket.emit('doneevent', {
      event: event,
      groupId,
      nickname,
      forNickname,
      userIdChange: userId,
    });
    toggleLoading(false);
    close();
  }
  ///////////////////////////////////////////////////////////////////////
  return (
    <OptionsModal close={close} visible={visible}>
      {event.todo && (userId === event.forId || event.forId === '') && (
        <OptionWithIcon
          iconStyle={event.done ? {top: 0} : {top: 2}}
          source={
            event.done
              ? require('../assets/xIcon.png')
              : require('../assets/checkIcon3.png')
          }
          onPress={updateDoneEventGroup}
          text={event.done ? 'Undo' : 'DONE!'}
          color={event.done ? colors.secondary : colors.details}
          rippleColor={event.done ? colors.ripple : colors.ripple2}
        />
      )}
      {userId === event.userId && (
        <>
          <OptionWithIcon
            color={colors.secondary}
            source={require('../assets/editIcon.png')}
            text="Edit"
            onPress={() => {
              close();
              openModal2();
            }}
          />
          <OptionWithIcon
            color={colors.secondary}
            source={require('../assets/trashIcon.png')}
            text="Delete"
            onPress={openConfirmModal}
          />
        </>
      )}
    </OptionsModal>
  );
}

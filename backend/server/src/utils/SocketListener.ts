import {Socket} from 'socket.io';

export default function (socket: Socket, admin: any) {
  console.log(`⚡: ${socket.id} user just connected!`);

  let userId: string;

  socket.on('disconnect', () => {
    socket.disconnect();
    console.log(`🔥: ${socket.id} user disconnected`);
  });

  socket.on('joinPrivate', data => {
    userId = data;
  });

  socket.on('newmessage', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'newmessageIN', dataa: JSON.stringify(sendBack)},
      topic: data.groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('diavastike', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'diavastikeIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newitem', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'newitemIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('purchaseditems', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'purchaseditemsIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updateitem', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updateitemIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deleteitems', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deleteitemsIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deletepurchaseditems', data => {
    const msg = {
      data: {type: 'deletepurchaseditemsIN', dataa: JSON.stringify({})},
      topic: data.groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deletedaymeals', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deletedaymealsIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deletemeals', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deletemealsIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newmeal', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'newmealIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updatemeal', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updatemealIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newnote', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'newnoteIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updatenote', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updatenoteIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deletenotes', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deletenotesIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('pinnednotes', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'pinnednotesIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newphotos', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'newphotosIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deletephotos', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deletephotosIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('renamealbum', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'renamealbumIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newalbum', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'newalbumIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deletealbum', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deletealbumIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('movephotos', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'movephotosIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('deleteevent', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'deleteeventIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('doneevent', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'doneeventIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newevent', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'neweventIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updateevent', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updateeventIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updatenickname', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updatenicknameIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updatecolor', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updatecolorIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('updateusername', data => {
    const {groups, ...sendBack} = data;
    groups.forEach((g: any) => {
      const msg = {
        data: {type: 'updateusernameIN', dataa: JSON.stringify(sendBack)},
        topic: g,
      };
      admin.messaging().send(msg);
    });
  });

  socket.on('updatebirthdate', data => {
    const {groups, ...sendBack} = data;
    groups.forEach((g: any) => {
      const msg = {
        data: {type: 'updatebirthdateIN', dataa: JSON.stringify(sendBack)},
        topic: g,
      };
      admin.messaging().send(msg);
    });
  });

  socket.on('updateadmin', data => {
    const {groupId, ...sendBack} = data;
    const msg = {
      data: {type: 'updateadminIN', dataa: JSON.stringify(sendBack)},
      topic: groupId,
    };
    admin.messaging().send(msg);
  });

  socket.on('newmember', data => {
    const {groupId, group, member} = data;
    const msg = {
      data: {type: 'newmemberIN', dataa: JSON.stringify(member)},
      topic: groupId,
    };
    admin.messaging().send(msg);
    const msg2 = {
      data: {type: 'newgroupIN', dataa: JSON.stringify(group)},
      topic: member.userId,
    };
    admin.messaging().send(msg2);
  });

  socket.on('removemember', data => {
    const msg = {
      data: {type: 'removememberIN', dataa: JSON.stringify(data)},
      topic: data.groupId,
    };
    admin.messaging().send(msg);
    const msg2 = {
      data: {type: 'removegroupIN', dataa: JSON.stringify(data)},
      topic: data.member,
    };
    admin.messaging().send(msg2);
  });

  socket.on('removemembers', data => {
    const {members, ...sendBack} = data;
    const msg = {
      data: {type: 'removemembersIN', dataa: JSON.stringify(data)},
      topic: sendBack.groupId,
    };
    admin.messaging().send(msg);
    members.forEach((m: any) => {
      const msg2 = {
        data: {type: 'removegroupIN', dataa: JSON.stringify(sendBack)},
        topic: m,
      };
      admin.messaging().send(msg2);
    });
  });

  socket.on('deleteaccount', data => {
    const {groups, member} = data;
    groups.forEach((g: any) => {
      const msg = {
        data: {
          type: 'removememberIN',
          dataa: JSON.stringify({member, groupId: g}),
        },
        topic: g,
      };
      admin.messaging().send(msg);
    });
  });

  socket.on('', data => {
    const {groupId, ...sendBack} = data;
    socket.to(groupId).emit('', sendBack);
  });
}

import {Request, Response} from 'express';
import {ObjectId} from 'mongodb';

const router = require('express').Router();

import Group from '../models/Group';
import User from '../models/User';

//new group me admin-return new group
router.route('/newgroup').post(async (req: Request, res: Response) => {
  const adminId = req.body.adminId;
  const album = {userId: '1', name: 'Any'};
  const newGroup = new Group({
    name: req.body.name,
    adminId: adminId,
    members: req.body.members,
    albums: album,
  });
  const createdGroup = await newGroup.save();
  const group = {
    _id: createdGroup._id,
    name: createdGroup.name,
    adminId: createdGroup.adminId,
  };
  res.json(group);
});

//get group
router.route('/:id/getgroup').get(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {
    name: 1,
    adminId: 1,
    members: 1,
    items: 1,
    meals: 1,
    albums: 1,
    photos: 1,
    notes: 1,
    events: 1,
  });
  res.json(group);
});

//change admin
router.route('/:id/changeadmin').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$set: {adminId: req.body.userId}},
  );
  res.json(group);
});

//disband group, remove group from users-return
router
  .route('/:id/disbandgroup')
  .delete(async (req: Request, res: Response) => {
    const group = await Group.deleteOne({_id: req.params.id});
    res.json(group);
  });

//new member to group-return newMember
router.route('/:id/members/new').put(async (req: Request, res: Response) => {
  if (ObjectId.isValid(req.body.userId)) {
    const user = await User.findById(req.body.userId);
    if (user) {
      const randomColor =
        '#' + (Math.random() * 0xfffff * 1000000).toString(16).slice(0, 6);
      const newMember = {
        userId: user._id,
        nickname: user.username,
        color: randomColor,
        birthdate: user.birthdate,
      };
      const group = await Group.updateOne(
        {_id: req.params.id},
        {$push: {members: newMember}},
      );
      res.json(newMember);
    } else {
      res.json(null);
    }
  } else {
    res.json(null);
  }
});

//get members of group
router.route('/:id/members/get').get(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {_id: 1});
  if (group) {
    const members = group.members.map(member => ({
      userId: member.userId,
      nickname: member.nickname,
      color: member.color,
    }));
    res.json(members);
  } else {
    res.json(null);
  }
});

//remove member from group-return group
router.route('/:id/members/remove').put(async (req: Request, res: Response) => {
  const grp = await Group.findById(req.params.id, {adminId: 1});
  const group = await Group.updateOne(
    {_id: req.params.id},
    {
      $pull: {
        members: {userId: req.body.userId},
        events: {userId: req.body.userId},
        items: {userId: req.body.userId},
        meals: {userId: req.body.userId},
        notes: {userId: req.body.userId},
      },
      $set: {
        'photos.$[elem].userId': grp?.adminId,
        'albums.$[elem].userId': grp?.adminId,
      },
    },
    {
      arrayFilters: [{'elem.userId': req.body.userId}],
    },
  );
  res.json(group);
});

//remove all members from group-return group
router
  .route('/:id/members/removeall')
  .put(async (req: Request, res: Response) => {
    const group = await Group.updateOne(
      {_id: req.params.id},
      {
        $pull: {
          members: {userId: {$ne: req.body.userId}},
          events: {userId: {$ne: req.body.userId}},
          items: {userId: {$ne: req.body.userId}},
          meals: {userId: {$ne: req.body.userId}},
          notes: {userId: {$ne: req.body.userId}},
        },
        $set: {
          'photos.$[elem].userId': req.body.userId,
          'albums.$[elem].userId': req.body.userId,
        },
      },
      {
        arrayFilters: [{'elem.userId': {$ne: req.body.userId}}],
      },
    );
    res.json(group);
  });

//update color of member-return updateMemmber
router
  .route('/:id/members/updatecolor')
  .put(async (req: Request, res: Response) => {
    const group = await Group.findById(req.params.id, {_id: 1});
    if (group) {
      const updateGroup = await Group.updateOne(
        {_id: req.params.id, 'members.userId': req.body.userId},
        {$set: {'members.$.color': req.body.color}},
      );
      res.json(updateGroup);
    } else {
      res.json(null);
    }
  });

//update nickname of member-return updateMemmber
router
  .route('/:id/members/updatenickname')
  .put(async (req: Request, res: Response) => {
    const group = await Group.findById(req.params.id, {_id: 1});
    if (group) {
      const update: {[key: string]: any} = {};
      update['members.$.nickname'] = req.body.name;
      req.body.name === req.body.username
        ? (update['members.$.originalname'] = true)
        : (update['members.$.originalname'] = false);
      const updateGroup = await Group.updateOne(
        {_id: req.params.id, 'members.userId': req.body.userId},
        {$set: update},
      );
      res.json(updateGroup);
    } else {
      res.json(null);
    }
  });

//new item to shopping list, return item
router.route('/:id/items/new').put(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {_id: 1});
  if (group) {
    const newItem = {
      userId: req.body.userId,
      name: req.body.name,
      image: req.body.image,
    };
    const updateGroup = await Group.updateOne(
      {_id: req.params.id},
      {$push: {items: newItem}},
    );
    const updatedGroup = await Group.findOne(
      {_id: req.params.id, 'items.name': req.body.name},
      {'items.$': 1},
    );
    res.json(updatedGroup?.items[0]);
  } else {
    res.json(null);
  }
});

//get items-return items
router.route('/:id/items/get').get(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {_id: 1});
  if (group) {
    res.json(group.items);
  } else {
    res.json(null);
  }
});

//remove items from group-return group
router.route('/:id/items/remove').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$pull: {items: {_id: {$in: req.body.ids}}}},
  );
  res.json(group);
});

//remove purchased items-return group
router
  .route('/:id/items/removepurchased')
  .put(async (req: Request, res: Response) => {
    const group = await Group.findById(req.params.id, {_id: 1});
    if (group) {
      const updateGroup = await Group.updateOne(
        {_id: req.params.id},
        {$pull: {items: {purchased: true}}},
      );
      res.json(updateGroup);
    } else {
      res.json(null);
    }
  });

//update item purchase state-return group
router
  .route('/:id/items/updatepurchased')
  .put(async (req: Request, res: Response) => {
    const group = await Group.findById(req.params.id, {_id: 1});
    if (group) {
      const updateGroup = await Group.updateOne(
        {_id: req.params.id},
        {$set: {'items.$[elem].purchased': req.body.value}},
        {arrayFilters: [{'elem._id': {$in: req.body.ids}}]},
      );
      res.json(updateGroup);
    } else {
      res.json(null);
    }
  });

//update item name-return group
router.route('/:id/items/update').put(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {_id: 1});
  if (group) {
    const update: any = {};
    update['items.$.name'] = req.body.name;
    if (req.body.image || req.body.clear)
      update['items.$.image'] = req.body.image;
    const updateGroup = await Group.updateOne(
      {'items._id': req.body.itemId},
      {$set: update},
    );
    const updatedGroup = await Group.findOne(
      {_id: req.params.id, 'items._id': req.body.itemId},
      {'items.$': 1},
    );
    res.json(updatedGroup?.items[0]);
  } else {
    res.json(null);
  }
});

//new meal
router.route('/:id/meals/new').put(async (req: Request, res: Response) => {
  const newMeal = {
    userId: req.body.userId,
    name: req.body.name,
    type: req.body.type,
    day: req.body.day,
    image: req.body.image,
  };
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$push: {meals: newMeal}},
  );
  const updatedGroup = await Group.findOne(
    {
      _id: req.params.id,
      meals: {
        $elemMatch: {
          name: req.body.name,
          day: req.body.day,
          type: req.body.type,
        },
      },
    },
    {'meals.$': 1},
  );
  res.json(updatedGroup?.meals[0]);
});

//get meals
router.route('/:id/meals/get').get(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, 'meals');
  res.json(group?.meals);
});

//remove meals
router.route('/:id/meals/remove').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$pull: {meals: {_id: {$in: req.body.ids}}}},
  );
  res.json(group);
});

//remove day meals
router
  .route('/:id/meals/removeday')
  .put(async (req: Request, res: Response) => {
    const group = await Group.updateOne(
      {_id: req.params.id},
      {$pull: {meals: {day: req.body.day}}},
    );
    res.json(group);
  });

// update meal
router.route('/:id/meals/update').put(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {_id: 1});
  if (group) {
    const update: any = {};
    update['meals.$.name'] = req.body.name;
    update['meals.$.type'] = req.body.type;
    update['meals.$.day'] = req.body.day;
    if (req.body.image || req.body.clear)
      update['meals.$.image'] = req.body.image;
    const updateGroup = await Group.updateOne(
      {'meals._id': req.body.mealId},
      {$set: update},
    );
    const updatedGroup = await Group.findOne(
      {_id: req.params.id, 'meals._id': req.body.mealId},
      {'meals.$': 1},
    );
    res.json(updatedGroup?.meals[0]);
  } else {
    res.json(null);
  }
});

//new photo
router.route('/:id/photos/new').put(async (req: Request, res: Response) => {
  const images = req.body.images;
  const newPhoto = images.map((i: string) => {
    return {
      userId: req.body.userId,
      image: i,
      album: req.body.album,
    };
  });
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$push: {photos: {$each: newPhoto}}},
  );
  const updatedGroup = await Group.findById(req.params.id, 'photos');
  res.json(updatedGroup?.photos);
});

//get photos
router.route('/:id/photos/get').get(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, 'photos');
  res.json(group?.photos);
});

//move photos to another album
router.route('/:id/photos/move').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$set: {'photos.$[elem].album': req.body.value}},
    {arrayFilters: [{'elem._id': {$in: req.body.ids}}]},
  );
  res.json(group);
});

//delete photos
router.route('/:id/photos/delete').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$pull: {photos: {_id: {$in: req.body.ids}}}},
  );
  res.json(group);
});

//new album
router.route('/:id/albums/new').put(async (req: Request, res: Response) => {
  const newAlbum = {
    userId: req.body.userId,
    name: req.body.name,
  };
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$push: {albums: newAlbum}},
  );
  const updatedGroup = await Group.findOne(
    {_id: req.params.id, 'albums.name': req.body.name},
    {'albums.$': 1},
  );
  res.json(updatedGroup?.albums[0]);
});

//update album name
router
  .route('/:id/albums/updatename')
  .put(async (req: Request, res: Response) => {
    const group = await Group.findById(req.params.id, {_id: 1});
    if (group) {
      const updateGroup = await Group.updateOne(
        {'albums._id': req.body.albumId},
        {$set: {'albums.$.name': req.body.value}},
      );
      const updateGroup2 = await Group.updateOne(
        {_id: req.params.id},
        {$set: {'photos.$[elem].album': req.body.value}},
        {arrayFilters: [{'elem.album': req.body.prevValue}]},
      );
      res.json(updateGroup2);
    } else {
      res.json(null);
    }
  });

//remove album
router.route('/:id/albums/remove').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {
      $pull: {
        albums: {_id: req.body.albumId},
        photos: {album: req.body.albumName},
      },
    },
  );
  res.json(group);
});

//new note
router.route('/:id/notes/new').put(async (req: Request, res: Response) => {
  const newNote = {
    userId: req.body.userId,
    title: req.body.title,
    text: req.body.text,
    pinned: req.body.pinned,
  };
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$push: {notes: newNote}},
  );
  const updatedGroup = await Group.findOne(
    {
      _id: req.params.id,
      notes: {
        $elemMatch: {
          userId: req.body.userId,
          title: req.body.title,
          text: req.body.text,
        },
      },
    },
    {'notes.$': 1},
  );
  res.json(updatedGroup?.notes[0]);
});

//update note
router.route('/:id/notes/update').put(async (req: Request, res: Response) => {
  const group = await Group.findById(req.params.id, {_id: 1});
  if (group) {
    const updateGroup = await Group.updateOne(
      {'notes._id': req.body.noteId},
      {
        $set: {
          'notes.$.title': req.body.title,
          'notes.$.text': req.body.text,
          'notes.$.pinned': req.body.pinned,
        },
      },
    );
    res.json(updateGroup);
  } else {
    res.json(null);
  }
});

//update pinned notes
router
  .route('/:id/notes/updatepinned')
  .put(async (req: Request, res: Response) => {
    const group = await Group.findById(req.params.id, {_id: 1});
    if (group) {
      const group = await Group.updateOne(
        {_id: req.params.id},
        {$set: {'notes.$[elem].pinned': req.body.value}},
        {arrayFilters: [{'elem._id': {$in: req.body.ids}}]},
      );
      res.json(group);
    } else {
      res.json(null);
    }
  });

//delete notes
router.route('/:id/notes/delete').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$pull: {notes: {_id: {$in: req.body.ids}}}},
  );
  res.json(group);
});

//new event
router.route('/:id/events/new').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$push: {events: req.body.event}},
  );
  const updatedGroup = await Group.findOne(
    {_id: req.params.id, events: {$elemMatch: req.body.event}},
    {'events.$': 1},
  );
  res.json(updatedGroup?.events[0]);
});

//update event
router.route('/:id/events/update').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {'events._id': req.body.event._id},
    {$set: {'events.$': req.body.event}},
  );
  res.json(group);
});

//update done event
router
  .route('/:id/events/updatedone')
  .put(async (req: Request, res: Response) => {
    const group = await Group.updateOne(
      {'events._id': req.body.eventId},
      {$set: {'events.$.done': req.body.value}},
    );
    res.json(group);
  });

//delete past events
router
  .route('/:id/events/deletepast')
  .put(async (req: Request, res: Response) => {
    const group = await Group.updateOne(
      {_id: req.params.id},
      {$pull: {events: {_id: {$in: req.body.ids}}}},
    );
    res.json(group);
  });

//delete event
router.route('/:id/events/delete').put(async (req: Request, res: Response) => {
  const group = await Group.updateOne(
    {_id: req.params.id},
    {$pull: {events: {_id: req.body.eventId}}},
  );
  res.json(group);
});

//new message
router
  .route('/:id/chat/newmessage')
  .put(async (req: Request, res: Response) => {
    const newMessage = {
      userId: req.body.userId,
      text: req.body.text,
      date: req.body.date,
    };
    const group = await Group.updateOne(
      {_id: req.params.id},
      {$push: {messages: newMessage}},
    );
    const updatedGroup = await Group.findOne(
      {_id: req.params.id, 'messages.date': req.body.date},
      {'messages.$': 1},
    );
    res.json(updatedGroup?.messages[0]);
  });

//load messages
router
  .route('/:id/chat/loadmessages/:index')
  .get(async (req: Request, res: Response) => {
    let index = Number(req.params.index);
    index -= 40;
    const group = await Group.findOne(
      {_id: req.params.id},
      {
        messages: {$slice: [index, 40]},
        name: 0,
        adminId: 0,
        members: 0,
        items: 0,
        meals: 0,
        albums: 0,
        photos: 0,
        notes: 0,
        events: 0,
      },
    );
    // console.log(group);
    const size = await Group.aggregate([
      {$match: {_id: ObjectId.createFromHexString(req.params.id)}},
      {$project: {size: {$size: '$messages'}}},
    ]);
    // console.log(size);
    res.json({msgs: group?.messages, all: size[0].size});
  });

//diavastike
router
  .route('/:id/chat/diavastike')
  .put(async (req: Request, res: Response) => {
    const group = await Group.updateOne(
      {_id: req.params.id, 'members.userId': req.body.userId},
      {$set: {'members.$.lastRead': req.body.messageId}},
    );
    res.json(group);
  });

router.route('/:id/delmsgs').put(async (req: Request, res: Response) => {
  console.log('chat deleted');
  const group2 = await Group.updateOne(
    {_id: req.params.id},
    {$set: {messages: []}},
  );
  res.json(group2);
});

module.exports = router;

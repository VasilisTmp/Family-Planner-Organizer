import {Request, Response} from 'express';
import Group from '../models/Group';
const router = require('express').Router();

import User from '../models/User';

//new user-return new user
router.route('/new').post(async (req: Request, res: Response) => {
  const exists = await User.findOne({email: req.body.email});
  if (exists) {
    res.json(null);
  } else {
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      birthdate: '',
    });
    const createdUser = await newUser.save();
    res.json(createdUser);
  }
});

//delete user and everything related from the group
router.route('/:id/delete').delete(async (req: Request, res: Response) => {
  const id = req.params.id;
  const admin = await Group.findOne({adminId: id}, {_id: 1});
  if (!admin) {
    const users = await User.deleteOne({_id: id});
    const groups = await Group.find(
      {'members.userId': id},
      {_id: 1, adminId: 1},
    );
    const eee = groups.map(async g => {
      const grp = await Group.updateOne(
        {_id: g._id},
        {
          $pull: {
            members: {userId: id},
            events: {userId: id},
            items: {userId: id},
            meals: {userId: id},
            notes: {userId: id},
          },
          $set: {
            'photos.$[elem].userId': g.adminId,
            'albums.$[elem].userId': g.adminId,
          },
        },
        {arrayFilters: [{'elem.userId': id}]},
      );
      return grp;
    });
    const responses = await Promise.all(eee);
    res.json(null);
  } else {
    res.json(admin);
  }
});

//return all users
router.route('/').get(async (req: Request, res: Response) => {
  const users = await User.find();
  res.json(users);
});

//login check-return user
router.route('/login').post(async (req: Request, res: Response) => {
  const user = await User.findOne({
    email: req.body.email,
    password: req.body.password,
  });
  res.json(user);
});

//delete all users-return users
router.route('/').delete(async (req: Request, res: Response) => {
  const users = await User.deleteMany();
  res.json(users);
});

//update username
router.route('/:id/updateusername').put(async (req: Request, res: Response) => {
  const user = await User.updateOne(
    {_id: req.params.id},
    {$set: {username: req.body.name}},
  );
  const groups = await Group.updateMany(
    {'members.userId': req.params.id, 'members.originalname': true},
    {$set: {'members.$[elem].nickname': req.body.name}},
    {arrayFilters: [{'elem.userId': req.params.id, 'elem.originalname': true}]},
  );
  const groups2 = await Group.updateMany(
    {'members.userId': req.params.id, 'members.nickname': req.body.name},
    {$set: {'members.$[elem].originalname': true}},
    {
      arrayFilters: [
        {'elem.userId': req.params.id, 'elem.nickname': req.body.name},
      ],
    },
  );
  res.json(groups);
});

//update username
router
  .route('/:id/updatebirthdate')
  .put(async (req: Request, res: Response) => {
    const user = await User.updateOne(
      {_id: req.params.id},
      {$set: {birthdate: req.body.date}},
    );
    const groups = await Group.updateMany(
      {'members.userId': req.params.id},
      {$set: {'members.$[elem].birthdate': req.body.date}},
      {arrayFilters: [{'elem.userId': req.params.id}]},
    );
    res.json(groups);
  });

//get groups of user
router.route('/:id/getgroups').get(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (user) {
    const groups = await Group.find(
      {'members.userId': req.params.id},
      {_id: 1, name: 1, adminId: 1},
    );
    res.json(groups);
  } else {
    res.json(null);
  }
});

//get passwprd of user
router.route('/:id/getpassword').get(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id, {password: 1});
  res.json(user?.password);
});

module.exports = router;

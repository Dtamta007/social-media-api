const router = require('express').Router();
const User = require("../models/User");
const bcrypt = require('bcrypt');

// Update User
router.post('/:id/update', async (req,res)=>{
    if(req.params.id === req.body.userId || req.body.isAdmin){
        if(req.body.password){
            try{
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            }catch(err){
                res.status(500).json(err);
            }
        }
        try{
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body
            });
            res.status(200).json("Account has been updated!");
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("Only owner and admin can update the account!");
    }    
})

// Delete User
router.post('/:id/delete', async (req,res)=>{
    if(req.params.id === req.body.userId || req.body.isAdmin){
        try{
            const user = await User.deleteOne({_id: req.params.id});
            res.status(200).json("Account has been Deleted!");
        }catch(err){
            res.status(500).json(err);
        }
    }else{
        res.status(403).json("Only owner and admin can delete the account!");
    }    
})

// Get a User
router.get('/', async (req,res)=>{
    const userId = req.query.userId;
    const username = req.query.username;

    try{
        const user = userId 
            ? await User.findOne({_id: userId}) 
            : await User.findOne({username: username});
        if(!user){
            res.status(404).json("User not found")
        }
        const {password, ...others} = user._doc;
        res.status(200).json(others);
    }catch(err){
        res.status(500).json(err);
    }
})

// get Friends
router.get("/friends/:userId", async(req,res)=>{
    try{
        const user = await User.findOne({_id: req.params.userId});
        const friends = await Promise.all(
            user.followers.map((followerId)=>{
                return User.findById(followerId);
            })
        );
        let friendList = [];
        friends.map((friend) =>{
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        });
        res.status(200).json(friendList);
    }catch(err){
        res.status(500).json(err);
    }
})

// Follow User
router.post('/:id/follow', async (req,res)=>{
    if(!req.params.id !== req.body.userId){

        try{
            const user = await User.findOne({_id: req.params.id});
            const curr = await User.findOne({_id: req.body.userId});

            if(!user.followers.includes(req.body.userId)){
                await user.updateOne({$push:{
                    followers: req.body.userId
                }});
                await curr.updateOne({$push:{
                    following: req.params.id
                }});
                res.status(200).json("User has been followed")                
            }else{
                res.status(403).json("You already follow this user.")
            }
        }catch(err){
            res.status(500).json(err);
        }

    }else{
        res.status(403).json("You cannot follow yourself");
    }
})

// Unfollow User
router.post('/:id/unfollow', async (req,res)=>{
    if(!req.params.id !== req.body.userId){

        try{
            const user = await User.findOne({_id: req.params.id});
            const curr = await User.findOne({_id: req.body.userId});

            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{
                    followers: req.body.userId
                }});
                await curr.updateOne({$pull:{
                    following: req.params.id
                }});
                res.status(200).json("User has been unfollowed")                
            }else{
                res.status(403).json("You don't follow this user.")
            }
        }catch(err){
            res.status(500).json(err);
        }

    }else{
        res.status(403).json("You cannot unfollow yourself");
    }
})

module.exports = router;
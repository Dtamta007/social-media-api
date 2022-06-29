const router = require('express').Router();
const Post = require('../models/Post');
const User = require('../models/User');
// Create a post

router.post('/', async(req,res)=>{
    const newPost = new Post(req.body);
    try{
        const post = await newPost.save();
        res.status(200).json(post);
    }catch(err){
        res.status(500).json(err);
    }
})

// Update a post
router.post('/:id/update', async(req,res)=>{
    try{
        const post = await Post.findOne({_id: req.params.id});
        if(!post){
            res.status(404).json("No posts found!");
        }
        if(post.userId === req.body.userId){
            await post.updateOne({$set: req.body});
            res.status(200).json("Post updated successfully!");
        }else{
            res.status(401).json("Only owner can update this post!");
        }
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})
// Delete a post
router.post('/:id/delete', async(req,res)=>{
    try{
        const post = await Post.findOne({_id: req.params.id});
        if(post.userId === req.body.userId || req.body.isAdmin){
            await post.deleteOne();
            res.status(200).json("Post deleted successfully!");
        }else{
            res.status(401).json("Only the owner and admin can delete posts!")
        }
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
});
// like a post
router.post('/:id/like', async(req,res)=>{
    try{
        const post = await Post.findOne({_id: req.params.id});
        if(!post.likes.includes(req.body.userId)){
            await post.updateOne({$push:{
                likes: req.body.userId
            }})
            res.status(200).json("Post liked!");
        }else{
            await post.updateOne({$pull:{
                likes: req.body.userId
            }})
            res.status(200).json("Post disliked!");
        }
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})
// get a post
router.get('/:id', async(req,res)=>{
    try{
        const post = await Post.findOne({_id: req.params.id});
        if(post){
            res.status(200).json(post);
        }else{
            res.status(404).json("No posts found");
        }
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})
// get timeline
router.get('/timeline/:userId', async(req,res)=>{
    try{
        const user = await User.findOne({_id: req.params.userId});
        const posts = await Post.find({userId: user._id});
        const following = user.following;
        const friendsPost = await Promise.all(
            following.map((friendId)=>{
                return Post.find({userId: friendId});
            })
        )
        res.status(200).json(posts.concat(...friendsPost));
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})

// get user's all posts

router.get('/profile/:username', async(req,res)=>{
    try{
        const user = await User.findOne({username : req.params.username});
        const posts = await Post.find({userId : user._id});
        res.status(200).json(posts);
        console.log(posts);
    }catch(err){
        console.log(err);
        res.status(500).json(err);
    }
})

module.exports = router;
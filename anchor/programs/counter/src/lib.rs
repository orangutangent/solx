#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("9J4UHWXz5UrGZtr9KZBF6W4TD1JxcnLNCdN2rS7ANTCJ");

#[program]
pub mod solx {

    use super::*;


    pub fn create_author(ctx: Context<CreateAuthor>, name: String, bio: String) -> Result<()> {
        require!(name.len() <= 32, ErrorCode::NameTooLong);
        require!(bio.len() <= 100, ErrorCode::BioTooLong);
        let author = &mut ctx.accounts.author;
        author.name = name;
        author.bio = bio;
        author.owner = ctx.accounts.owner.key();
        author.post_count = 0;
        author.followers = 0;
        author.following = 0;
        Ok(())
    }

    pub fn edit_name(ctx: Context<EditName>, name: String) -> Result<()> {
        require!(name.len() <= 32, ErrorCode::NameTooLong);
        let author = &mut ctx.accounts.author;
        author.name = name;
        Ok(())
    }

    pub fn edit_bio(ctx: Context<EditBio>, bio: String) -> Result<()> {
        require!(bio.len() <= 100, ErrorCode::BioTooLong);
        let author = &mut ctx.accounts.author;
        author.bio = bio;
        Ok(())
    }

    pub fn create_post(ctx: Context<CreatePost>, timestamp: i64, content: String) -> Result<()> {
        require!(ctx.accounts.author.owner == ctx.accounts.owner.key(), ErrorCode::CanNotDeletePost);
        require!(content.len() <= 256, ErrorCode::ContentTooLong);
        require!(timestamp > 0, ErrorCode::InvalidTimestamp);

        
        let post = &mut ctx.accounts.post;
        let author = &mut ctx.accounts.author;
        post.author = author.key();
        post.content = content;
        post.timestamp = timestamp;
        author.post_count = author.post_count.checked_add(1).ok_or(error!(ErrorCode::Overflow))?;

        Ok(())
    }

    pub fn delete_post(ctx: Context<DeletePost>, _id: u64) -> Result<()> {
        let author = &mut ctx.accounts.author;
        require!(author.key() == ctx.accounts.post.author, ErrorCode::CanNotDeletePost);
        author.post_count = author.post_count.checked_sub(1).ok_or(error!(ErrorCode::Overflow))?;
        Ok(())
    }

    pub fn follow (ctx: Context<Follow>, _author_key: Pubkey) -> Result<()> {
        let follower = &mut ctx.accounts.follower;
        let followed = &mut ctx.accounts.followed;

        require!(follower.key() != followed.key(), ErrorCode::CanNotFollowYourself);



        let follow_relation = &mut ctx.accounts.follow_relation;
        follow_relation.follower = follower.key();
        follow_relation.followed = followed.key();
         
        follower.following = follower.following.checked_add(1).ok_or(error!(ErrorCode::Overflow))?;
        followed.followers = followed.followers.checked_add(1).ok_or(error!(ErrorCode::Overflow))?;

        Ok(())
    }

    pub fn unfollow (ctx: Context<Unfollow>, author_key: Pubkey) -> Result<()> {
        let follower = &mut ctx.accounts.follower;
        let followed = &mut ctx.accounts.followed;

        require!(follower.key() != followed.key(), ErrorCode::CanNotFollowYourself);
        
        follower.following = follower.following.checked_sub(1).ok_or(error!(ErrorCode::Overflow))?;
        followed.followers = followed.followers.checked_sub(1).ok_or(error!(ErrorCode::Overflow))?;

        Ok(())
    }

}


#[derive(Accounts)]
pub struct CreateAuthor<'info> {
    #[account(init, payer = owner, space = 8 + Author::INIT_SPACE, seeds = [owner.key().as_ref()], bump)]
    pub author: Account<'info, Author>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}


#[derive(Accounts)]
pub struct EditName<'info> {
    #[account(mut, has_one = owner)]
    pub author: Account<'info, Author>,
    #[account(mut)]
    pub owner: Signer<'info>,

}

#[derive(Accounts)]
pub struct EditBio<'info> {
    #[account(mut, has_one = owner)]
    pub author: Account<'info, Author>,
    #[account(mut)]
    pub owner: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(timestamp: i64, content: String)]
pub struct CreatePost<'info> {
    #[account(mut, seeds = [owner.key().as_ref()], bump, has_one = owner)]
    pub author: Account<'info, Author>,

    #[account(init, payer = owner, space = 8 + Post::INIT_SPACE, seeds = [b"post", author.key().as_ref(), timestamp.to_le_bytes().as_ref()], bump)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(id: u64)]
pub struct DeletePost<'info> {
    #[account(mut, seeds = [author.key().as_ref()], bump, has_one = owner)]
    pub author: Account<'info, Author>,
    #[account(mut, seeds = [b"post",author.key().as_ref(), id.to_le_bytes().as_ref()], bump, close = owner)]
    pub post: Account<'info, Post>,
    #[account(mut)]
    pub owner: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(author_key: Pubkey)]
pub struct Follow<'info> {
    #[account(mut, has_one = owner)]
    pub follower: Account<'info, Author>,
    #[account(mut)]
    pub owner : Signer<'info>,

    #[account(mut, seeds = [author_key.as_ref()], bump)]
    pub followed : Account<'info, Author>,

    #[account(init, payer = owner, space = 8 + FollowRelation::INIT_SPACE, seeds = [author_key.as_ref(), owner.key().as_ref()], bump)]
    pub follow_relation: Account<'info, FollowRelation>,

    system_program: Program<'info, System>,

}

#[derive(Accounts)]
#[instruction(author_key: Pubkey)]
pub struct Unfollow<'info> {
    #[account(mut, has_one = owner)]
    pub follower: Account<'info, Author>,
    #[account(mut)]
    pub owner : Signer<'info>,

    #[account(mut, seeds = [author_key.as_ref()], bump)]
    pub followed : Account<'info, Author>,

    #[account(mut, seeds = [author_key.as_ref(), owner.key().as_ref()], bump, close = owner)]
    pub follow_relation: Account<'info, FollowRelation>,
}


#[account]
#[derive(InitSpace)]
pub struct Author {
    #[max_len(32)]
    pub name: String,
    pub owner: Pubkey,
    #[max_len(100)]
    pub bio: String,

    pub post_count: u64,

    pub followers: u64,

    pub following: u64,
}

#[account]
#[derive(InitSpace)]
pub struct FollowRelation {
    pub follower: Pubkey,
    pub followed: Pubkey,
}



#[account]
#[derive(InitSpace)]
pub struct Post {
    pub author: Pubkey,
    #[max_len(256)]
    pub content: String,
    pub timestamp: i64,
}


#[error_code]
pub enum ErrorCode {
    #[msg("You cannot follow yourself")]
    CanNotFollowYourself,

    #[msg("Overflow occurred")]
    Overflow,

    #[msg("You cannot unfollow this author")]
    CanNotUnfollow,

    #[msg("Name is too long")]
    NameTooLong,

    #[msg("Bio is too long")]
    BioTooLong,

    #[msg("Content is too long")]
    ContentTooLong,

    #[msg("Post not found")]
    PostNotFound,

    #[msg("You cannot delete this post")]
    CanNotDeletePost,

    #[msg("Invalid timestamp")]
    InvalidTimestamp    


}

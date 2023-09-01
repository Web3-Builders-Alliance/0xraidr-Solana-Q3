use anchor_lang::prelude::*;
use anchor_spl::{token::{TokenAccount, Mint, Token}, associated_token::AssociatedToken};

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod escrow {
    use super::*;

    pub fn make(ctx: Context<Make>, seed: u64, offer_amount: u64, deposit_amount: u64) -> Result<()> {
        let escrow = &mut ctx.accounts.escrow;
        escrow.maker = *ctx.accounts.maker.key;
        escrow.maker_token = *ctx.accounts.maker_token.to_account_info().key;
        escrow.taker_token = *ctx.accounts.taker_token.to_account_info().key;
        escrow.offer_amount = offer_amount;
        escrow.seed = seed;
        escrow.auth_bump = *ctx.bumps.get("auth").unwrap();
        escrow.vault_bump = *ctx.bumps.get("vault").unwrap();
        escrow.escrow_bump = *ctx.bumps.get("escrow").unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(
    seed: u64
)]
 struct Make<'info> {
    #[account(mut,
    associated_token::mint = maker_token,
    associated_token::authority = maker,
    )]
    maker: Signer<'info>,
    #[account(mut)]
    maker_ata: Account<'info, TokenAccount>,
    maker_token: Account<'info, Mint>,
    taker_token: Account<'info, Mint>,
    #[account(
        seeds = [b"auth"],
        bump
    )]
    /// CHECK: This is Safe
    auth: UncheckedAccount<'info>,
    #[account(
        init,
        payer = maker,
        token::mint = maker_token,
        token::authority = auth,
        seeds = [b"vault", escrow.key.as_ref()],
        bump
    )]
    vault: Account<'info, TokenAccount>,
    #[account(
       init,
       payer = maker,
       space = Escrow::LEN,
       seeds = [b"escrow", maker.key.as_ref(), seed.to_le_bytes().as_ref()],
       bump
    )]
    escrow: Account<'info, Escrow>,
    token_program: Program<'info, Token>,
    associated_token_program: Program<'info, AssociatedToken>,
    system_program: Program<'info, System>
}

#[account]
pub struct Escrow {
    maker: Pubkey,
    maker_token: Pubkey,
    taker_token: Pubkey,
    offer_amount: u64,
    seed: u64,
    auth_bump: u8,
    vault_bump: u8,
    escrow_bump: u8,
}

impl Escrow {
    pub const LEN: usize = 8 + 32 * 3 + 8 * 2 + 3 * 1;
}

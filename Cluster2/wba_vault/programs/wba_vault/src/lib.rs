use anchor_lang::prelude::*;
use anchor_lang::system_program::Transfer;
use anchor_spl::{
    token,
    associated_token::{self, AssociatedToken},
    token::{Token, TokenAccount, Mint},
    token::Transfer as TransferSPL,
    token::transfer as spl_transfer,
};



declare_id!("Gr2zyUBmy5Em85K6qYB6pzCqg4pMp4PRENmyQ6n4tVJs");

#[program]
pub mod wba_vault {
    use anchor_lang::system_program::transfer;

    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        ctx.accounts.state.auth_bump = *ctx.bumps.get("auth").unwrap();
        ctx.accounts.state.state_bump = *ctx.bumps.get("state").unwrap();
        ctx.accounts.state.vault_bump = *ctx.bumps.get("vault").unwrap();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: ctx.accounts.owner.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi = CpiContext::new(
            ctx.accounts.system_program.to_account_info(),
            accounts,
        );
        transfer(cpi, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        let accounts = Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.owner.to_account_info(),
        };

        let seeds = &[
            b"vault",
            ctx.accounts.state.to_account_info().key.as_ref(),
            &[ctx.accounts.state.vault_bump][..]
        ];

        let signer_seeds = &[&seeds[..]];

        let cpi = CpiContext::new_with_signer(
            ctx.accounts.system_program.to_account_info(),
            accounts,
            signer_seeds
        );
        transfer(cpi, amount)
    }

    pub fn deposit_spl(ctx: Context<SPLDeposit>, amount: u64) -> Result<()> {
        let accounts = TransferSPL {
            from: ctx.accounts.owner_ata.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
            authority: ctx.accounts.owner.to_account_info()
        };
        let cpi = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            accounts,
        );
        spl_transfer(cpi, amount)
    }

    pub fn withdraw_spl(ctx: Context<SPLWithdraw>, amount: u64) -> Result<()> {
        let accounts = TransferSPL {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.owner_ata.to_account_info(),
            authority: ctx.accounts.auth.to_account_info()
        };

        let seeds = &[
            b"auth",
            ctx.accounts.state.to_account_info().key.as_ref(),
            &[ctx.accounts.state.auth_bump][..]
        ];

        let signer_seeds = &[&seeds[..]];

        let cpi = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            accounts,
            signer_seeds
        );
        spl_transfer(cpi, amount)
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    // PDA Signer for SPL Vault
    #[account(
        seeds = [b"auth", state.key().as_ref()],
        bump
    )]
    ///CHECK: NO NEED TO CHECK THIS
    auth: UncheckedAccount<'info>,
    // Where we store our SOL  
        #[account(
        seeds = [b"vault", state.key().as_ref()],
        bump
    )]
    vault: SystemAccount<'info>,  
    #[account(
        init,
        payer = owner,
        space = VaultState::LEN,
        seeds = [b"state", owner.key().as_ref()],
        bump
    )]
    state: Account<'info, VaultState>,  
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    // Where we store our SOL  
        #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump = state.vault_bump
    )]
    vault: SystemAccount<'info>,  
    #[account(
        seeds = [b"state", owner.key().as_ref()],
        bump =  state.state_bump
    )]
    state: Account<'info, VaultState>,  
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    // Where we store our SOL  
        #[account(
        mut,
        seeds = [b"vault", state.key().as_ref()],
        bump = state.vault_bump
    )]
    vault: SystemAccount<'info>,  
    #[account(
        seeds = [b"state", owner.key().as_ref()],
        bump =  state.state_bump
    )]
    state: Account<'info, VaultState>,  
    system_program: Program<'info, System>
}

#[derive(Accounts)]
pub struct SPLDeposit<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        mut,
        associated_token::authority = owner,
        associated_token::mint = mint,
    )]
    owner_ata: Account<'info, TokenAccount>,
    mint: Account<'info, Mint>,
        // PDA Signer for SPL Vault
    #[account(
            seeds = [b"auth", state.key().as_ref()],
            bump = state.auth_bump,
    )]
    ///CHECK: NO NEED TO CHECK THIS
    auth: UncheckedAccount<'info>,
    #[account(
        init,
        payer = owner,
        seeds = [b"spl_vault", state.key().as_ref()],
        token::authority = auth,
        token::mint = mint,
        bump
    )]
    vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"state", owner.key().as_ref()],
        bump =  state.state_bump
    )]
    state: Account<'info, VaultState>,
    token_program: Program<'info, Token>,
    assicoated_token_program: Program<'info, AssociatedToken>,  
    system_program: Program<'info, System>
}


#[derive(Accounts)]
pub struct SPLWithdraw<'info> {
    #[account(mut)]
    owner: Signer<'info>,
    #[account(
        mut,
        associated_token::authority = owner,
        associated_token::mint = mint,
    )]
    owner_ata: Account<'info, TokenAccount>,
    mint: Account<'info, Mint>,
        // PDA Signer for SPL Vault
    #[account(
            seeds = [b"auth", state.key().as_ref()],
            bump = state.auth_bump,
    )]
    ///CHECK: NO NEED TO CHECK THIS
    auth: UncheckedAccount<'info>,
    #[account(
        mut,
        close = owner,
        seeds = [b"spl_vault", state.key().as_ref()],
        token::authority = auth,
        token::mint = mint,
        bump
    )]
    vault: Account<'info, TokenAccount>,

    #[account(
        seeds = [b"state", owner.key().as_ref()],
        bump =  state.state_bump
    )]
    state: Account<'info, VaultState>,
    token_program: Program<'info, Token>,
    assicoated_token_program: Program<'info, AssociatedToken>,  
    system_program: Program<'info, System>
}

#[account]
pub struct VaultState {
    auth_bump: u8,
    vault_bump: u8,
    state_bump: u8
}

impl VaultState {
    const LEN: usize = 8 + 3 * 1;
}

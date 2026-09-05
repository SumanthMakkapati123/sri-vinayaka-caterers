import { pbkdf2Sync, randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
// A fresh 192-bit owner password. Never put this file in dist or source control.
const password=randomBytes(24).toString('base64url');
const salt=randomBytes(16).toString('hex');
const hash=pbkdf2Sync(password,salt,100000,32,'sha256').toString('hex');
const record=`pbkdf2:100000:${salt}:${hash}`;
if(process.argv.includes('--local')) {
 writeFileSync('.dev.vars',`OWNER_PASSWORD_HASH=${record}\n`,{mode:0o600});
 console.log('Local test password (not production): '+password);
} else {
 writeFileSync('/private/tmp/sri-vinayaka-owner-hash.txt',record,{mode:0o600});
 console.log('Owner password — save in your password manager: '+password);
 console.log('Hash saved to /private/tmp/sri-vinayaka-owner-hash.txt. Set the Worker secret using the setup guide.');
}

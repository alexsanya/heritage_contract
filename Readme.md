
# **Screw the lawyers - the code is law or how to make a non-custodial testament using web3 and smart-contracts**
This project adresses the problems of legal system and banking system and allows to make testaments in a modern way using blockchain technology

[Video instruction](https://youtu.be/011J4l032Ec)
Web application: https://smart-testament.web.app/

## The problems with making testaments using legal system
- Lawyers fees for any change you want to make
- Exposure to particular jurisdiction - it could change ower time not in your favor
- Exposure to the custodian authority
- Problems with cross-jurisdictions funds transfer

## Alternative way
 We can take an advantage from the blockchain as it has neither borders nor central authorities, but has real value. To make it possible for non-programmers I've deployed smart contract and UI interface so everyone can use it. The only thing to learn is how to use Metamask wallet
 
 ##  Advantages of encoding testament in smart contract
 - "The code is law" - noone have a power to change the rules you encoded
 - Noone can freeze your funds
 - Noone will charge anormous fees for cross-border transfers
 - The code is opened and could be audited by anyone to ensure the safety and correctness of logic
 
## How it works
- Assets deposited to smart contract in form of ERC20 tokens
- The owner of testament could deposit and withdraw funds any time or delete testament completely and get all tokens back to his wallet
- Each heir have to submit an "apply" transaction, only then owner can include his wallet address into testament - this is a safety measure to prevent invalid addresses and make sure someone owns a private key and would be able to withdraw
- Owner specifies the list of heirs and their shares
- Owner specifies the monthly amount for each heir
- The owner specifies locking period - while he alive he have to send ping-transactions regularly - once every locking period. If there was no pings for longer than locking period, the funds would be unlocked to the heirs he specified. Heirs cannot make any withdrowals before locking period exceeded.
- Owner is able to change list of heirs, their shares, monthly limits and unlocking period any time
- Successors can claim their shares after locking period exceeded
- There is no limit to the number of testament owner can create - each testament supports only one ERC20 token, so if you hold your assets in several tokens you have to create several testaments - one for each token
- Single wallet could be a heir for multiple testaments

##  The risks
- ERC20 tokens could potentially drop to zero in value - even if it supposed to be a stable coin. To prevent it owner can withdraw his assets and create new testament with another tokens if there is a risk of token price collapse.
- The lost of private key - if owner loses private key the tokens would be unlocked for heirs after a while, but if a hair lost his private key then his share would be frozen forever. That's why I recomment to educate the heirs about how to keep private key safe - preferrable on hardware wallet and how to keep your seed phrase.
- The centralize exchanges could stop working with Polygon blockchain - then it would be impossible to convert tokens to fiat. Now it seems very unlikely as Polygon second most popular after Ethereum main net.
- The whole blockchain could go down or been deprecated - the most unlikely scenario  - some global disaster should happen in order to force all the nodes to shut down, and anouncement of deprecation should be made way before it happens
- The only centralized part is a web server where UI is deployed - but if it goes down it is still possible to interact with smart contract via Remix IDE or UI could be launched locally

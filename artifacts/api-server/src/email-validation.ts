import dns from "dns/promises";

const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com","guerrillamail.com","guerrillamail.net","guerrillamail.org",
  "guerrillamail.biz","guerrillamail.de","guerrillamail.info","grr.la",
  "guerrillamailblock.com","sharklasers.com","spam4.me","trashmail.com",
  "trashmail.me","trashmail.at","trashmail.io","trashmail.net","trashmail.org",
  "fakeinbox.com","maildrop.cc","mailnull.com","mailnesia.com","mailforspam.com",
  "spamgourmet.com","tempr.email","tempmail.com","tmpmail.org","tmpmail.net",
  "dispostable.com","crazymailing.com","10minutemail.com","10minutemail.net",
  "10minutemail.org","minutemail.com","tempinbox.com","temp-mail.org",
  "temp-mail.io","throwam.com","throwaway.email","yopmail.com","yopmail.fr",
  "cool.fr.nf","jetable.fr.nf","nospam.ze.tc","nomail.xl.cx","mega.zik.dj",
  "speed.1s.fr","courriel.fr.nf","moncourrier.fr.nf","monemail.fr.nf",
  "monmail.fr.nf","spam.la","spamfree24.org","spamgob.com","spam.su",
  "spamherelots.com","spamthisplease.com","tradermail.info","trbvm.com",
  "mailnull.com","inboxproxy.com","spambox.us","spambox.info","mailexpire.com",
  "spamgourmet.net","spamgourmet.org","spaml.de","spammotel.com","spaml.com",
  "mailzilla.com","mailzilla.org","binkmail.com","bobmail.info","chammy.info",
  "devnullmail.com","letthemeatspam.com","mailinater.com","mailinator2.com",
  "mailme.lv","mailme.gq","mail-temporaire.fr","puglieisi.com","rcpt.at",
  "s0ny.net","sharedmailbox.org","smellfear.com","snakemail.com","snkmail.com",
  "sogetthis.com","soodonims.com","spamhereplease.com","spamex.com",
  "speed.1s.fr","suremail.info","teleworm.us","temporarioemail.com.br",
  "tempsky.com","thankyou2010.com","throwam.com","tilien.com","tmailinator.com",
  "trashdevil.com","trashdevil.de","trashemail.de","trashmail.at","trashmail.me",
  "trash-mail.at","trash-me.com","tunxis.com","tyldd.com","uggsrock.com",
  "upliftnow.com","uplipht.com","veryrealemail.com","vidchart.com","viditag.com",
  "viewcastmedia.com","viewcastmedia.net","viewcastmedia.org","webm4il.info",
  "wegwerfemail.de","wetrainbayarea.com","wetrainbayarea.org","wh4f.org",
  "whyspam.me","willselfdestruct.com","wilemail.com","wimsg.com","wronghead.com",
  "wuzupmail.net","xagloo.com","xemaps.com","xents.com","xmaily.com","xoxy.net",
  "xyzfree.net","yapped.net","yep.it","yogamaven.com","yopmail.gq","yopmail.pp.ua",
  "youmail.ga","yourdomain.com","ypmail.webarnak.fr.eu.org","yuurok.com",
  "z1p.biz","za.com","zehnminuten.de","zehnminutenmail.de","zetmail.com",
  "zippymail.info","zoemail.net","zoemail.org","zomg.info","zxcv.com","zxcvbnm.com",
  "zzz.com","filzmail.com","fivemail.de","fixmail.tk","fizmail.com","fleckens.hu",
  "fls4.gleeze.com","fly-ts.de","flyspam.com","fmailbox.com","fmailc.com",
  "fnh.so","frapmail.com","freeplumbing.com","freewallet.me","friscaa.com",
  "front14.org","fudgerub.com","fux0ringduh.com","fxnxs.com","garliclife.com",
  "gawab.com","get2mail.fr","getmail.no","getonemail.com","getonemail.net",
  "gishpuppy.com","glitch.sx","gmal.com","gmatch.org","gnctr-calgary.com",
  "gogreeninc.com","gotmail.com","gotmail.net","gotmail.org","h.mintemail.com",
  "h8s.org","habitue.net","hackersquad.tk","hailmail.net","haltospam.com",
  "hatespam.org","herp.in","hidemail.de","hidzz.com","hmamail.com",
  "ieatspam.eu","ieatspam.info","ieh-mail.de","imails.info","inboxbear.com",
  "incognitomail.com","incognitomail.net","incognitomail.org","inoutmail.de",
  "inoutmail.eu","inoutmail.info","inoutmail.net","insorg-mail.info",
  "instant-mail.de","ipoo.org","irish2me.com","iwi.net","jetable.com",
  "jetable.net","jetable.org","jnxjn.com","jourrapide.com","jsrsolutions.com",
  "junk.to","junkemail.com","junkmail.com","junkmail.gq","kasmail.com",
  "kaspop.com","killmail.com","killmail.net","kimsdisk.com","klassmaster.com",
  "klzlk.com","koszmail.pl","kurzepost.de","lhsdv.com","lifebyfood.com",
  "link2mail.net","litedrop.com","loadby.us","lol.ovpn.to","lortemail.dk",
  "lovemeleaveme.com","ltuc.net","lukecarriere.com","lukemail.info",
  "lukop.dk","m21.cc","m4ilweb.info","maboard.com","mail-filter.com",
  "mail-temporaire.com","mailbidon.com","mailbiz.biz","mailblocks.com",
  "mailcatch.com","maileater.com","maileme101.com","mailexpire.com",
  "mailfa.tk","mailfreeonline.com","mailfs.com","mailguard.me","mailimate.com",
  "mailin8r.com","mailinater.com","mailismagic.com","mailme.ir","mailme24.com",
  "mailmoth.com","mailmoat.com","mailnew.com","mailnew.com","mailnew.com",
  "mailpick.biz","mailquack.com","mailsac.com","mailscrap.com","mailseal.de",
  "mailshell.com","mailsiphon.com","mailslapping.com","mailslite.com",
  "mailtemp.info","mailtemporaire.com","mailtemporaire.fr","mailthink.net",
  "mailtome.de","mailtothis.com","mailzi.com","mailzilla.org","makemetheking.com",
  "malahov.de","mansiondev.com","marbased.com","mbx.cc","mciek.com",
  "mega.zik.dj","meltmail.com","messagebeamer.de","mezimages.net",
  "mierdamail.com","mintemail.com","misterpinball.de","mnbacc.com",
  "moakt.cc","moakt.co","moakt.com","moakt.ws","mobi.web.id","mobileninja.co.uk",
  "moburl.com","mohmal.com","moncourrier.fr.nf","monemail.fr.nf","monmail.fr.nf",
  "msa.minsmail.com","mt2009.com","mt2014.com","mt2015.com","mytempemail.com",
  "mywarnmail.com","netzidiot.de","nevalenamos.com","nfmail.com",
  "no-spam.ws","nobody.com","nobulk.com","noclickemail.com","nodezine.com",
  "nokiamail.com","nonspam.eu","nonspammer.de","noref.in","norival.com",
  "nospam.ze.tc","nospamfor.us","nospammail.net","nospamthanks.info",
  "notmailinator.com","nowmymail.com","nsk.ro","nwldx.com","objectmail.com",
  "obobbo.com","odnorazovoe.ru","okrent.us","oneoffemail.com","oneoffmail.com",
  "oopi.org","ordinaryamerican.net","ovpn.to","owlpic.com","pancakemail.com",
  "parlimentpetitioner.tk","pimpedupmyspace.com","pingir.com","pjjkp.com",
  "plexolan.de","pmp.sc","politikerclub.de","postalmail.biz","postinbox.com",
  "postpro.net","powered.name","prochesmail.com","proxymail.eu","prtnx.com",
  "prtz.eu","putthisinyourspamdatabase.com","putthisinyourspamdatabase.com",
  "q00.com","quickinbox.com","rcpt.at","recursor.net","rejectmail.com",
  "reliable-mail.com","rfcdomain.com","rklips.com","rmqkr.net","rppkn.com",
  "rtrtr.com","s0ny.net","safe-mail.gq","safetymail.info","safetypost.de",
  "sandelf.de","sebil.com","secretemail.de","secure-email.me","securehost.com.es",
  "sexyalwasmi.top","sharedmailbox.org","shieldemail.com","shiftmail.com",
  "shitmail.me","shortmail.net","showslow.de","siliwangi.ga","silvercoin.life",
  "simed.com","sinna.icu","slaskpost.se","smashmail.de","smellfear.com",
  "snakemail.com","sneakemail.com","sneakmail.de","snkmail.com","sogetthis.com",
  "soodomail.com","soodonims.com","spam.su","spamavert.com","spambob.com",
  "spambob.net","spambob.org","spambog.com","spambog.de","spambog.ru",
  "spambotshere.com","spamcon.org","spamcorptastic.com","spamcowboy.com",
  "spamcowboy.net","spamcowboy.org","spamday.com","spamex.com",
  "spamfake.com","spamfree.eu","spamgoblin.com","spamhereplease.com",
  "spamhole.com","spamify.com","spaminator.de","spamkill.info","spaml.com",
  "spaml.de","spammotel.com","spammy.host","spamnot.com","spamops.net",
  "spamspot.com","spamstack.net","spamthis.co.uk","spamtrail.com",
  "supergreatmail.com","supermailer.jp","superstachel.de","suremail.info",
  "svk.jp","sweetxxx.de","tafmail.com","tagyourself.com","techemail.com",
  "teleosaurs.xyz","teleworm.us","temp.bartcrumb.com","temp.emeraldwebmail.com",
  "tempail.com","tempalias.com","tempe-mail.com","tempemail.biz","tempemail.com",
  "tempemail.co.za","tempemail.net","tempinbox.com","tempmail.eu","tempmailer.com",
  "tempmailer.de","tempomail.fr","temporaryemail.net","temporaryemail.us",
  "temporaryforwarding.com","temporaryinbox.com","temporarymail.org",
  "tempthe.net","tgasa.com","thanksnospam.com","thc.st","thelimestones.com",
  "thisisnotmyrealemail.com","throwam.com","throwaway.email","throwcrap.com",
  "tilien.com","tmail.com","tmail.io","tmailinator.com","toiea.com","tokem.co",
  "tomokachi.com","trashcanmail.com","trashdevil.com","trashdevil.de",
  "trashemail.de","trashmail.at","trashmail.com","trashmail.io","trashmail.me",
  "trashmail.net","trashmail.org","trashmailer.com","trashmail.xyz",
  "trashtipper.com","trbvm.com","trillianpro.com","tryalert.com","turual.com",
  "twinmail.de","twoweirdtricks.com","tyldd.com","umail.net","upliftnow.com",
  "uroid.com","us.af","venompen.com","veryrealemail.com","viditag.com",
  "viewcastmedia.com","visal168.ga","vomoto.com","vpn.st","vsimcard.com",
  "vubby.com","walala.org","walkmail.net","walkmail.ru","welikecookies.com",
  "wetrainbayarea.com","wetrainbayarea.org","wh4f.org","whyspam.me",
  "wickmail.net","willselfdestruct.com","wintremail.com","wronghead.com",
  "wuzupmail.net","wwwnew.eu","x24.com","xagloo.com","xemaps.com","xents.com",
  "xmaily.com","xoxy.net","xyzfree.net","ya.ru","yapped.net","yep.it",
  "yopmail.com","yopmail.fr","yopmail.gq","yopmail.net","ypmail.webarnak.fr.eu.org",
  "yuurok.com","z1p.biz","zehnminuten.de","zehnminutenmail.de","zetmail.com",
  "zippymail.info","zoemail.net","zoemail.org","zomg.info","zxcv.com",
]);

export type EmailValidationResult = {
  valid: boolean;
  reason?: string;
};

export async function validateEmail(email: string): Promise<EmailValidationResult> {
  const normalised = email.trim().toLowerCase();

  const parts = normalised.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    return { valid: false, reason: "Invalid email format" };
  }

  const domain = parts[1];

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      valid: false,
      reason: "Disposable or temporary email addresses are not allowed. Please use a real email address.",
    };
  }

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("DNS timeout")), 5000)
    );
    const lookup = dns.resolveMx(domain);
    const records = await Promise.race([lookup, timeout]);

    if (!records || records.length === 0) {
      return {
        valid: false,
        reason: `The email domain "${domain}" does not appear to be a valid mail domain. Please use a real email address.`,
      };
    }
  } catch (err: any) {
    if (err?.message === "DNS timeout") {
      return { valid: true };
    }
    return {
      valid: false,
      reason: `The email domain "${domain}" could not be verified. Please use a real email address.`,
    };
  }

  return { valid: true };
}

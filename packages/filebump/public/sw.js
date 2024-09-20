//strict mode
"use strict";

//glob
var mimes = [{ mime: 'application/vnd.hzn-3d-crossword', ext: '.x3d' },
{ mime: 'video/3gpp', ext: '.3gp' },
{ mime: 'video/3gpp2', ext: '.3g2' },
{ mime: 'application/vnd.mseq', ext: '.mseq' },
{ mime: 'application/vnd.3m.post-it-notes', ext: '.pwn' },
{ mime: 'application/vnd.3gpp.pic-bw-large', ext: '.plb' },
{ mime: 'application/vnd.3gpp.pic-bw-small', ext: '.psb' },
{ mime: 'application/vnd.3gpp.pic-bw-var', ext: '.pvb' },
{ mime: 'application/vnd.3gpp2.tcap', ext: '.tcap' },
{ mime: 'application/x-7z-compressed', ext: '.7z' },
{ mime: 'application/x-abiword', ext: '.abw' },
{ mime: 'application/x-ace-compressed', ext: '.ace' },
{ mime: 'application/vnd.americandynamics.acc', ext: '.acc' },
{ mime: 'application/vnd.acucobol', ext: '.acu' },
{ mime: 'application/vnd.acucorp', ext: '.atc' },
{ mime: 'audio/adpcm', ext: '.adp' },
{ mime: 'application/x-authorware-bin', ext: '.aab' },
{ mime: 'application/x-authorware-map', ext: '.aam' },
{ mime: 'application/x-authorware-seg', ext: '.aas' },
{ mime: 'application/vnd.adobe.air-application-installer-package+zip', ext: '.air' },
{ mime: 'application/x-shockwave-flash', ext: '.swf' },
{ mime: 'application/vnd.adobe.fxp', ext: '.fxp' },
{ mime: 'application/pdf', ext: '.pdf' },
{ mime: 'application/vnd.cups-ppd', ext: '.ppd' },
{ mime: 'application/x-director', ext: '.dir' },
{ mime: 'application/vnd.adobe.xdp+xml', ext: '.xdp' },
{ mime: 'application/vnd.adobe.xfdf', ext: '.xfdf' },
{ mime: 'audio/x-aac', ext: '.aac' },
{ mime: 'application/vnd.ahead.space', ext: '.ahead' },
{ mime: 'application/vnd.airzip.filesecure.azf', ext: '.azf' },
{ mime: 'application/vnd.airzip.filesecure.azs', ext: '.azs' },
{ mime: 'application/vnd.amazon.ebook', ext: '.azw' },
{ mime: 'application/vnd.amiga.ami', ext: '.ami' },
{ mime: 'application/vnd.android.package-archive', ext: '.apk' },
{ mime: 'application/vnd.anser-web-certificate-issue-initiation', ext: '.cii' },
{ mime: 'application/vnd.anser-web-funds-transfer-initiation', ext: '.fti' },
{ mime: 'application/vnd.antix.game-component', ext: '.atx' },
{ mime: 'application/x-apple-diskimage', ext: '.dmg' },
{ mime: 'application/vnd.apple.installer+xml', ext: '.mpkg' },
{ mime: 'application/applixware', ext: '.aw' },
{ mime: 'application/vnd.hhe.lesson-player', ext: '.les' },
{ mime: 'application/vnd.aristanetworks.swi', ext: '.swi' },
{ mime: 'text/x-asm', ext: '.s' },
{ mime: 'application/atomcat+xml', ext: '.atomcat' },
{ mime: 'application/atomsvc+xml', ext: '.atomsvc' },
{ mime: 'application/atom+xml', ext: '.atom, .xml' },
{ mime: 'application/pkix-attr-cert', ext: '.ac' },
{ mime: 'audio/x-aiff', ext: '.aif' },
{ mime: 'video/x-msvideo', ext: '.avi' },
{ mime: 'application/vnd.audiograph', ext: '.aep' },
{ mime: 'image/vnd.dxf', ext: '.dxf' },
{ mime: 'model/vnd.dwf', ext: '.dwf' },
{ mime: 'text/plain-bas', ext: '.par' },
{ mime: 'application/x-bcpio', ext: '.bcpio' },
{ mime: 'application/octet-stream', ext: '.bin' },
{ mime: 'image/bmp', ext: '.bmp' },
{ mime: 'application/x-bittorrent', ext: '.torrent' },
{ mime: 'application/vnd.rim.cod', ext: '.cod' },
{ mime: 'application/vnd.blueice.multipass', ext: '.mpm' },
{ mime: 'application/vnd.bmi', ext: '.bmi' },
{ mime: 'application/x-sh', ext: '.sh' },
{ mime: 'image/prs.btif', ext: '.btif' },
{ mime: 'application/vnd.businessobjects', ext: '.rep' },
{ mime: 'application/x-bzip', ext: '.bz' },
{ mime: 'application/x-bzip2', ext: '.bz2' },
{ mime: 'application/x-csh', ext: '.csh' },
{ mime: 'text/x-c', ext: '.c' },
{ mime: 'application/vnd.chemdraw+xml', ext: '.cdxml' },
{ mime: 'text/css', ext: '.css' },
{ mime: 'chemical/x-cdx', ext: '.cdx' },
{ mime: 'chemical/x-cml', ext: '.cml' },
{ mime: 'chemical/x-csml', ext: '.csml' },
{ mime: 'application/vnd.contact.cmsg', ext: '.cdbcmsg' },
{ mime: 'application/vnd.claymore', ext: '.cla' },
{ mime: 'application/vnd.clonk.c4group', ext: '.c4g' },
{ mime: 'image/vnd.dvb.subtitle', ext: '.sub' },
{ mime: 'application/cdmi-capability', ext: '.cdmia' },
{ mime: 'application/cdmi-container', ext: '.cdmic' },
{ mime: 'application/cdmi-domain', ext: '.cdmid' },
{ mime: 'application/cdmi-object', ext: '.cdmio' },
{ mime: 'application/cdmi-queue', ext: '.cdmiq' },
{ mime: 'application/vnd.cluetrust.cartomobile-config', ext: '.c11amc' },
{ mime: 'application/vnd.cluetrust.cartomobile-config-pkg', ext: '.c11amz' },
{ mime: 'image/x-cmu-raster', ext: '.ras' },
{ mime: 'model/vnd.collada+xml', ext: '.dae' },
{ mime: 'text/csv', ext: '.csv' },
{ mime: 'application/mac-compactpro', ext: '.cpt' },
{ mime: 'application/vnd.wap.wmlc', ext: '.wmlc' },
{ mime: 'image/cgm', ext: '.cgm' },
{ mime: 'x-conference/x-cooltalk', ext: '.ice' },
{ mime: 'image/x-cmx', ext: '.cmx' },
{ mime: 'application/vnd.xara', ext: '.xar' },
{ mime: 'application/vnd.cosmocaller', ext: '.cmc' },
{ mime: 'application/x-cpio', ext: '.cpio' },
{ mime: 'application/vnd.crick.clicker', ext: '.clkx' },
{ mime: 'application/vnd.crick.clicker.keyboard', ext: '.clkk' },
{ mime: 'application/vnd.crick.clicker.palette', ext: '.clkp' },
{ mime: 'application/vnd.crick.clicker.template', ext: '.clkt' },
{ mime: 'application/vnd.crick.clicker.wordbank', ext: '.clkw' },
{ mime: 'application/vnd.criticaltools.wbs+xml', ext: '.wbs' },
{ mime: 'application/vnd.rig.cryptonote', ext: '.cryptonote' },
{ mime: 'chemical/x-cif', ext: '.cif' },
{ mime: 'chemical/x-cmdf', ext: '.cmdf' },
{ mime: 'application/cu-seeme', ext: '.cu' },
{ mime: 'application/prs.cww', ext: '.cww' },
{ mime: 'text/vnd.curl', ext: '.curl' },
{ mime: 'text/vnd.curl.dcurl', ext: '.dcurl' },
{ mime: 'text/vnd.curl.mcurl', ext: '.mcurl' },
{ mime: 'text/vnd.curl.scurl', ext: '.scurl' },
{ mime: 'application/vnd.curl.car', ext: '.car' },
{ mime: 'application/vnd.curl.pcurl', ext: '.pcurl' },
{ mime: 'application/vnd.yellowriver-custom-menu', ext: '.cmp' },
{ mime: 'application/dssc+der', ext: '.dssc' },
{ mime: 'application/dssc+xml', ext: '.xdssc' },
{ mime: 'application/x-debian-package', ext: '.deb' },
{ mime: 'audio/vnd.dece.audio', ext: '.uva' },
{ mime: 'image/vnd.dece.graphic', ext: '.uvi' },
{ mime: 'video/vnd.dece.hd', ext: '.uvh' },
{ mime: 'video/vnd.dece.mobile', ext: '.uvm' },
{ mime: 'video/vnd.uvvu.mp4', ext: '.uvu' },
{ mime: 'video/vnd.dece.pd', ext: '.uvp' },
{ mime: 'video/vnd.dece.sd', ext: '.uvs' },
{ mime: 'video/vnd.dece.video', ext: '.uvv' },
{ mime: 'application/x-dvi', ext: '.dvi' },
{ mime: 'application/vnd.fdsn.seed', ext: '.seed' },
{ mime: 'application/x-dtbook+xml', ext: '.dtb' },
{ mime: 'application/x-dtbresource+xml', ext: '.res' },
{ mime: 'application/vnd.dvb.ait', ext: '.ait' },
{ mime: 'application/vnd.dvb.service', ext: '.svc' },
{ mime: 'audio/vnd.digital-winds', ext: '.eol' },
{ mime: 'image/vnd.djvu', ext: '.djvu' },
{ mime: 'application/xml-dtd', ext: '.dtd' },
{ mime: 'application/vnd.dolby.mlp', ext: '.mlp' },
{ mime: 'application/x-doom', ext: '.wad' },
{ mime: 'application/vnd.dpgraph', ext: '.dpg' },
{ mime: 'audio/vnd.dra', ext: '.dra' },
{ mime: 'application/vnd.dreamfactory', ext: '.dfac' },
{ mime: 'audio/vnd.dts', ext: '.dts' },
{ mime: 'audio/vnd.dts.hd', ext: '.dtshd' },
{ mime: 'image/vnd.dwg', ext: '.dwg' },
{ mime: 'application/vnd.dynageo', ext: '.geo' },
{ mime: 'application/ecmascript', ext: '.es' },
{ mime: 'application/vnd.ecowin.chart', ext: '.mag' },
{ mime: 'image/vnd.fujixerox.edmics-mmr', ext: '.mmr' },
{ mime: 'image/vnd.fujixerox.edmics-rlc', ext: '.rlc' },
{ mime: 'application/exi', ext: '.exi' },
{ mime: 'application/vnd.proteus.magazine', ext: '.mgz' },
{ mime: 'application/epub+zip', ext: '.epub' },
{ mime: 'message/rfc822', ext: '.eml' },
{ mime: 'application/vnd.enliven', ext: '.nml' },
{ mime: 'application/vnd.is-xpr', ext: '.xpr' },
{ mime: 'image/vnd.xiff', ext: '.xif' },
{ mime: 'application/vnd.xfdl', ext: '.xfdl' },
{ mime: 'application/emma+xml', ext: '.emma' },
{ mime: 'application/vnd.ezpix-album', ext: '.ez2' },
{ mime: 'application/vnd.ezpix-package', ext: '.ez3' },
{ mime: 'image/vnd.fst', ext: '.fst' },
{ mime: 'video/vnd.fvt', ext: '.fvt' },
{ mime: 'image/vnd.fastbidsheet', ext: '.fbs' },
{ mime: 'application/vnd.denovo.fcselayout-link', ext: '.fe_launch' },
{ mime: 'video/x-f4v', ext: '.f4v' },
{ mime: 'video/x-flv', ext: '.flv' },
{ mime: 'image/vnd.fpx', ext: '.fpx' },
{ mime: 'image/vnd.net-fpx', ext: '.npx' },
{ mime: 'text/vnd.fmi.flexstor', ext: '.flx' },
{ mime: 'video/x-fli', ext: '.fli' },
{ mime: 'application/vnd.fluxtime.clip', ext: '.ftc' },
{ mime: 'application/vnd.fdf', ext: '.fdf' },
{ mime: 'text/x-fortran', ext: '.f' },
{ mime: 'application/vnd.mif', ext: '.mif' },
{ mime: 'application/vnd.framemaker', ext: '.fm' },
{ mime: 'image/x-freehand', ext: '.fh' },
{ mime: 'application/vnd.fsc.weblaunch', ext: '.fsc' },
{ mime: 'application/vnd.frogans.fnc', ext: '.fnc' },
{ mime: 'application/vnd.frogans.ltf', ext: '.ltf' },
{ mime: 'application/vnd.fujixerox.ddd', ext: '.ddd' },
{ mime: 'application/vnd.fujixerox.docuworks', ext: '.xdw' },
{ mime: 'application/vnd.fujixerox.docuworks.binder', ext: '.xbd' },
{ mime: 'application/vnd.fujitsu.oasys', ext: '.oas' },
{ mime: 'application/vnd.fujitsu.oasys2', ext: '.oa2' },
{ mime: 'application/vnd.fujitsu.oasys3', ext: '.oa3' },
{ mime: 'application/vnd.fujitsu.oasysgp', ext: '.fg5' },
{ mime: 'application/vnd.fujitsu.oasysprs', ext: '.bh2' },
{ mime: 'application/x-futuresplash', ext: '.spl' },
{ mime: 'application/vnd.fuzzysheet', ext: '.fzs' },
{ mime: 'image/g3fax', ext: '.g3' },
{ mime: 'application/vnd.gmx', ext: '.gmx' },
{ mime: 'model/vnd.gtw', ext: '.gtw' },
{ mime: 'application/vnd.genomatix.tuxedo', ext: '.txd' },
{ mime: 'application/vnd.geogebra.file', ext: '.ggb' },
{ mime: 'application/vnd.geogebra.tool', ext: '.ggt' },
{ mime: 'model/vnd.gdl', ext: '.gdl' },
{ mime: 'application/vnd.geometry-explorer', ext: '.gex' },
{ mime: 'application/vnd.geonext', ext: '.gxt' },
{ mime: 'application/vnd.geoplan', ext: '.g2w' },
{ mime: 'application/vnd.geospace', ext: '.g3w' },
{ mime: 'application/x-font-ghostscript', ext: '.gsf' },
{ mime: 'application/x-font-bdf', ext: '.bdf' },
{ mime: 'application/x-gtar', ext: '.gtar' },
{ mime: 'application/x-texinfo', ext: '.texinfo' },
{ mime: 'application/x-gnumeric', ext: '.gnumeric' },
{ mime: 'application/vnd.google-earth.kml+xml', ext: '.kml' },
{ mime: 'application/vnd.google-earth.kmz', ext: '.kmz' },
{ mime: 'application/vnd.grafeq', ext: '.gqf' },
{ mime: 'image/gif', ext: '.gif' },
{ mime: 'text/vnd.graphviz', ext: '.gv' },
{ mime: 'application/vnd.groove-account', ext: '.gac' },
{ mime: 'application/vnd.groove-help', ext: '.ghf' },
{ mime: 'application/vnd.groove-identity-message', ext: '.gim' },
{ mime: 'application/vnd.groove-injector', ext: '.grv' },
{ mime: 'application/vnd.groove-tool-message', ext: '.gtm' },
{ mime: 'application/vnd.groove-tool-template', ext: '.tpl' },
{ mime: 'application/vnd.groove-vcard', ext: '.vcg' },
{ mime: 'video/h261', ext: '.h261' },
{ mime: 'video/h263', ext: '.h263' },
{ mime: 'video/h264', ext: '.h264' },
{ mime: 'application/vnd.hp-hpid', ext: '.hpid' },
{ mime: 'application/vnd.hp-hps', ext: '.hps' },
{ mime: 'application/x-hdf', ext: '.hdf' },
{ mime: 'audio/vnd.rip', ext: '.rip' },
{ mime: 'application/vnd.hbci', ext: '.hbci' },
{ mime: 'application/vnd.hp-jlyt', ext: '.jlt' },
{ mime: 'application/vnd.hp-pcl', ext: '.pcl' },
{ mime: 'application/vnd.hp-hpgl', ext: '.hpgl' },
{ mime: 'application/vnd.yamaha.hv-script', ext: '.hvs' },
{ mime: 'application/vnd.yamaha.hv-dic', ext: '.hvd' },
{ mime: 'application/vnd.yamaha.hv-voice', ext: '.hvp' },
{ mime: 'application/vnd.hydrostatix.sof-data', ext: '.sfd-hdstx' },
{ mime: 'application/hyperstudio', ext: '.stk' },
{ mime: 'application/vnd.hal+xml', ext: '.hal' },
{ mime: 'text/html', ext: '.html' },
{ mime: 'application/vnd.ibm.rights-management', ext: '.irm' },
{ mime: 'application/vnd.ibm.secure-container', ext: '.sc' },
{ mime: 'text/calendar', ext: '.ics' },
{ mime: 'application/vnd.iccprofile', ext: '.icc' },
{ mime: 'image/x-icon', ext: '.ico' },
{ mime: 'application/vnd.igloader', ext: '.igl' },
{ mime: 'image/ief', ext: '.ief' },
{ mime: 'application/vnd.immervision-ivp', ext: '.ivp' },
{ mime: 'application/vnd.immervision-ivu', ext: '.ivu' },
{ mime: 'application/reginfo+xml', ext: '.rif' },
{ mime: 'text/vnd.in3d.3dml', ext: '.3dml' },
{ mime: 'text/vnd.in3d.spot', ext: '.spot' },
{ mime: 'model/iges', ext: '.igs' },
{ mime: 'application/vnd.intergeo', ext: '.i2g' },
{ mime: 'application/vnd.cinderella', ext: '.cdy' },
{ mime: 'application/vnd.intercon.formnet', ext: '.xpw' },
{ mime: 'application/vnd.isac.fcs', ext: '.fcs' },
{ mime: 'application/ipfix', ext: '.ipfix' },
{ mime: 'application/pkix-cert', ext: '.cer' },
{ mime: 'application/pkixcmp', ext: '.pki' },
{ mime: 'application/pkix-crl', ext: '.crl' },
{ mime: 'application/pkix-pkipath', ext: '.pkipath' },
{ mime: 'application/vnd.insors.igm', ext: '.igm' },
{ mime: 'application/vnd.ipunplugged.rcprofile', ext: '.rcprofile' },
{ mime: 'application/vnd.irepository.package+xml', ext: '.irp' },
{ mime: 'text/vnd.sun.j2me.app-descriptor', ext: '.jad' },
{ mime: 'application/java-archive', ext: '.jar' },
{ mime: 'application/java-vm', ext: '.class' },
{ mime: 'application/x-java-jnlp-file', ext: '.jnlp' },
{ mime: 'application/java-serialized-object', ext: '.ser' },
{ mime: 'text/x-java-source,java', ext: '.java' },
{ mime: 'application/javascript', ext: '.js' },
{ mime: 'application/json', ext: '.json' },
{ mime: 'application/vnd.joost.joda-archive', ext: '.joda' },
{ mime: 'video/jpm', ext: '.jpm' },
{ mime: 'image/jpeg', ext: '.jpeg' },
{ mime: 'image/jpeg', ext: '.jpg' },
{ mime: 'image/pjpeg', ext: '.pjpeg' },
{ mime: 'video/jpeg', ext: '.jpgv' },
{ mime: 'application/vnd.kahootz', ext: '.ktz' },
{ mime: 'application/vnd.chipnuts.karaoke-mmd', ext: '.mmd' },
{ mime: 'application/vnd.kde.karbon', ext: '.karbon' },
{ mime: 'application/vnd.kde.kchart', ext: '.chrt' },
{ mime: 'application/vnd.kde.kformula', ext: '.kfo' },
{ mime: 'application/vnd.kde.kivio', ext: '.flw' },
{ mime: 'application/vnd.kde.kontour', ext: '.kon' },
{ mime: 'application/vnd.kde.kpresenter', ext: '.kpr' },
{ mime: 'application/vnd.kde.kspread', ext: '.ksp' },
{ mime: 'application/vnd.kde.kword', ext: '.kwd' },
{ mime: 'application/vnd.kenameaapp', ext: '.htke' },
{ mime: 'application/vnd.kidspiration', ext: '.kia' },
{ mime: 'application/vnd.kinar', ext: '.kne' },
{ mime: 'application/vnd.kodak-descriptor', ext: '.sse' },
{ mime: 'application/vnd.las.las+xml', ext: '.lasxml' },
{ mime: 'application/x-latex', ext: '.latex' },
{ mime: 'application/vnd.llamagraphics.life-balance.desktop', ext: '.lbd' },
{ mime: 'application/vnd.llamagraphics.life-balance.exchange+xml', ext: '.lbe' },
{ mime: 'application/vnd.jam', ext: '.jam' },
{ mime: 'application/vnd.lotus-1-2-3', ext: '.123' },
{ mime: 'application/vnd.lotus-approach', ext: '.apr' },
{ mime: 'application/vnd.lotus-freelance', ext: '.pre' },
{ mime: 'application/vnd.lotus-notes', ext: '.nsf' },
{ mime: 'application/vnd.lotus-organizer', ext: '.org' },
{ mime: 'application/vnd.lotus-screencam', ext: '.scm' },
{ mime: 'application/vnd.lotus-wordpro', ext: '.lwp' },
{ mime: 'audio/vnd.lucent.voice', ext: '.lvp' },
{ mime: 'audio/x-mpegurl', ext: '.m3u' },
{ mime: 'video/x-m4v', ext: '.m4v' },
{ mime: 'application/mac-binhex40', ext: '.hqx' },
{ mime: 'application/vnd.macports.portpkg', ext: '.portpkg' },
{ mime: 'application/vnd.osgeo.mapguide.package', ext: '.mgp' },
{ mime: 'application/marc', ext: '.mrc' },
{ mime: 'application/marcxml+xml', ext: '.mrcx' },
{ mime: 'application/mxf', ext: '.mxf' },
{ mime: 'application/vnd.wolfram.player', ext: '.nbp' },
{ mime: 'application/mathematica', ext: '.ma' },
{ mime: 'application/mathml+xml', ext: '.mathml' },
{ mime: 'application/mbox', ext: '.mbox' },
{ mime: 'application/vnd.medcalcdata', ext: '.mc1' },
{ mime: 'application/mediaservercontrol+xml', ext: '.mscml' },
{ mime: 'application/vnd.mediastation.cdkey', ext: '.cdkey' },
{ mime: 'application/vnd.mfer', ext: '.mwf' },
{ mime: 'application/vnd.mfmp', ext: '.mfm' },
{ mime: 'model/mesh', ext: '.msh' },
{ mime: 'application/mads+xml', ext: '.mads' },
{ mime: 'application/mets+xml', ext: '.mets' },
{ mime: 'application/mods+xml', ext: '.mods' },
{ mime: 'application/metalink4+xml', ext: '.meta4' },
{ mime: 'application/vnd.mcd', ext: '.mcd' },
{ mime: 'application/vnd.micrografx.flo', ext: '.flo' },
{ mime: 'application/vnd.micrografx.igx', ext: '.igx' },
{ mime: 'application/vnd.eszigno3+xml', ext: '.es3' },
{ mime: 'application/x-msaccess', ext: '.mdb' },
{ mime: 'video/x-ms-asf', ext: '.asf' },
{ mime: 'application/x-msdownload', ext: '.exe' },
{ mime: 'application/vnd.ms-artgalry', ext: '.cil' },
{ mime: 'application/vnd.ms-cab-compressed', ext: '.cab' },
{ mime: 'application/vnd.ms-ims', ext: '.ims' },
{ mime: 'application/x-ms-application', ext: '.application' },
{ mime: 'application/x-msclip', ext: '.clp' },
{ mime: 'image/vnd.ms-modi', ext: '.mdi' },
{ mime: 'application/vnd.ms-fontobject', ext: '.eot' },
{ mime: 'application/vnd.ms-excel', ext: '.xls' },
{ mime: 'application/vnd.ms-excel.addin.macroenabled.12', ext: '.xlam' },
{ mime: 'application/vnd.ms-excel.sheet.binary.macroenabled.12', ext: '.xlsb' },
{ mime: 'application/vnd.ms-excel.template.macroenabled.12', ext: '.xltm' },
{ mime: 'application/vnd.ms-excel.sheet.macroenabled.12', ext: '.xlsm' },
{ mime: 'application/vnd.ms-htmlhelp', ext: '.chm' },
{ mime: 'application/x-mscardfile', ext: '.crd' },
{ mime: 'application/vnd.ms-lrm', ext: '.lrm' },
{ mime: 'application/x-msmediaview', ext: '.mvb' },
{ mime: 'application/x-msmoney', ext: '.mny' },
{ mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ext: '.pptx' },
{ mime: 'application/vnd.openxmlformats-officedocument.presentationml.slide', ext: '.sldx' },
{ mime: 'application/vnd.openxmlformats-officedocument.presentationml.slideshow', ext: '.ppsx' },
{ mime: 'application/vnd.openxmlformats-officedocument.presentationml.template', ext: '.potx' },
{ mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', ext: '.xlsx' },
{ mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.template', ext: '.xltx' },
{ mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: '.docx' },
{ mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.template', ext: '.dotx' },
{ mime: 'application/x-msbinder', ext: '.obd' },
{ mime: 'application/vnd.ms-officetheme', ext: '.thmx' },
{ mime: 'application/onenote', ext: '.onetoc' },
{ mime: 'audio/vnd.ms-playready.media.pya', ext: '.pya' },
{ mime: 'video/vnd.ms-playready.media.pyv', ext: '.pyv' },
{ mime: 'application/vnd.ms-powerpoint', ext: '.ppt' },
{ mime: 'application/vnd.ms-powerpoint.addin.macroenabled.12', ext: '.ppam' },
{ mime: 'application/vnd.ms-powerpoint.slide.macroenabled.12', ext: '.sldm' },
{ mime: 'application/vnd.ms-powerpoint.presentation.macroenabled.12', ext: '.pptm' },
{ mime: 'application/vnd.ms-powerpoint.slideshow.macroenabled.12', ext: '.ppsm' },
{ mime: 'application/vnd.ms-powerpoint.template.macroenabled.12', ext: '.potm' },
{ mime: 'application/vnd.ms-project', ext: '.mpp' },
{ mime: 'application/x-mspublisher', ext: '.pub' },
{ mime: 'application/x-msschedule', ext: '.scd' },
{ mime: 'application/x-silverlight-app', ext: '.xap' },
{ mime: 'application/vnd.ms-pki.stl', ext: '.stl' },
{ mime: 'application/vnd.ms-pki.seccat', ext: '.cat' },
{ mime: 'application/vnd.visio', ext: '.vsd' },
{ mime: 'application/vnd.visio2013', ext: '.vsdx' },
{ mime: 'video/x-ms-wm', ext: '.wm' },
{ mime: 'audio/x-ms-wma', ext: '.wma' },
{ mime: 'audio/x-ms-wax', ext: '.wax' },
{ mime: 'video/x-ms-wmx', ext: '.wmx' },
{ mime: 'application/x-ms-wmd', ext: '.wmd' },
{ mime: 'application/vnd.ms-wpl', ext: '.wpl' },
{ mime: 'application/x-ms-wmz', ext: '.wmz' },
{ mime: 'video/x-ms-wmv', ext: '.wmv' },
{ mime: 'video/x-ms-wvx', ext: '.wvx' },
{ mime: 'application/x-msmetafile', ext: '.wmf' },
{ mime: 'application/x-msterminal', ext: '.trm' },
{ mime: 'application/msword', ext: '.doc' },
{ mime: 'application/vnd.ms-word.document.macroenabled.12', ext: '.docm' },
{ mime: 'application/vnd.ms-word.template.macroenabled.12', ext: '.dotm' },
{ mime: 'application/x-mswrite', ext: '.wri' },
{ mime: 'application/vnd.ms-works', ext: '.wps' },
{ mime: 'application/x-ms-xbap', ext: '.xbap' },
{ mime: 'application/vnd.ms-xpsdocument', ext: '.xps' },
{ mime: 'audio/midi', ext: '.mid' },
{ mime: 'application/vnd.ibm.minipay', ext: '.mpy' },
{ mime: 'application/vnd.ibm.modcap', ext: '.afp' },
{ mime: 'application/vnd.jcp.javame.midlet-rms', ext: '.rms' },
{ mime: 'application/vnd.tmobile-livetv', ext: '.tmo' },
{ mime: 'application/x-mobipocket-ebook', ext: '.prc' },
{ mime: 'application/vnd.mobius.mbk', ext: '.mbk' },
{ mime: 'application/vnd.mobius.dis', ext: '.dis' },
{ mime: 'application/vnd.mobius.plc', ext: '.plc' },
{ mime: 'application/vnd.mobius.mqy', ext: '.mqy' },
{ mime: 'application/vnd.mobius.msl', ext: '.msl' },
{ mime: 'application/vnd.mobius.txf', ext: '.txf' },
{ mime: 'application/vnd.mobius.daf', ext: '.daf' },
{ mime: 'text/vnd.fly', ext: '.fly' },
{ mime: 'application/vnd.mophun.certificate', ext: '.mpc' },
{ mime: 'application/vnd.mophun.application', ext: '.mpn' },
{ mime: 'video/mj2', ext: '.mj2' },
{ mime: 'audio/mpeg', ext: '.mpga' },
{ mime: 'video/vnd.mpegurl', ext: '.mxu' },
{ mime: 'video/mpeg', ext: '.mpeg' },
{ mime: 'application/mp21', ext: '.m21' },
{ mime: 'audio/mp4', ext: '.mp4a' },
{ mime: 'video/mp4', ext: '.mp4' },
{ mime: 'application/mp4', ext: '.mp4' },
{ mime: 'application/vnd.apple.mpegurl', ext: '.m3u8' },
{ mime: 'application/vnd.musician', ext: '.mus' },
{ mime: 'application/vnd.muvee.style', ext: '.msty' },
{ mime: 'application/xv+xml', ext: '.mxml' },
{ mime: 'application/vnd.nokia.n-gage.data', ext: '.ngdat' },
{ mime: 'application/vnd.nokia.n-gage.symbian.install', ext: '.n-gage' },
{ mime: 'application/x-dtbncx+xml', ext: '.ncx' },
{ mime: 'application/x-netcdf', ext: '.nc' },
{ mime: 'application/vnd.neurolanguage.nlu', ext: '.nlu' },
{ mime: 'application/vnd.dna', ext: '.dna' },
{ mime: 'application/vnd.noblenet-directory', ext: '.nnd' },
{ mime: 'application/vnd.noblenet-sealer', ext: '.nns' },
{ mime: 'application/vnd.noblenet-web', ext: '.nnw' },
{ mime: 'application/vnd.nokia.radio-preset', ext: '.rpst' },
{ mime: 'application/vnd.nokia.radio-presets', ext: '.rpss' },
{ mime: 'text/n3', ext: '.n3' },
{ mime: 'application/vnd.novadigm.edm', ext: '.edm' },
{ mime: 'application/vnd.novadigm.edx', ext: '.edx' },
{ mime: 'application/vnd.novadigm.ext', ext: '.ext' },
{ mime: 'application/vnd.flographit', ext: '.gph' },
{ mime: 'audio/vnd.nuera.ecelp4800', ext: '.ecelp4800' },
{ mime: 'audio/vnd.nuera.ecelp7470', ext: '.ecelp7470' },
{ mime: 'audio/vnd.nuera.ecelp9600', ext: '.ecelp9600' },
{ mime: 'application/oda', ext: '.oda' },
{ mime: 'application/ogg', ext: '.ogx' },
{ mime: 'audio/ogg', ext: '.oga' },
{ mime: 'video/ogg', ext: '.ogv' },
{ mime: 'application/vnd.oma.dd2+xml', ext: '.dd2' },
{ mime: 'application/vnd.oasis.opendocument.text-web', ext: '.oth' },
{ mime: 'application/oebps-package+xml', ext: '.opf' },
{ mime: 'application/vnd.intu.qbo', ext: '.qbo' },
{ mime: 'application/vnd.openofficeorg.extension', ext: '.oxt' },
{ mime: 'application/vnd.yamaha.openscoreformat', ext: '.osf' },
{ mime: 'audio/webm', ext: '.weba' },
{ mime: 'video/webm', ext: '.webm' },
{ mime: 'application/vnd.oasis.opendocument.chart', ext: '.odc' },
{ mime: 'application/vnd.oasis.opendocument.chart-template', ext: '.otc' },
{ mime: 'application/vnd.oasis.opendocument.database', ext: '.odb' },
{ mime: 'application/vnd.oasis.opendocument.formula', ext: '.odf' },
{ mime: 'application/vnd.oasis.opendocument.formula-template', ext: '.odft' },
{ mime: 'application/vnd.oasis.opendocument.graphics', ext: '.odg' },
{ mime: 'application/vnd.oasis.opendocument.graphics-template', ext: '.otg' },
{ mime: 'application/vnd.oasis.opendocument.image', ext: '.odi' },
{ mime: 'application/vnd.oasis.opendocument.image-template', ext: '.oti' },
{ mime: 'application/vnd.oasis.opendocument.presentation', ext: '.odp' },
{ mime: 'application/vnd.oasis.opendocument.presentation-template', ext: '.otp' },
{ mime: 'application/vnd.oasis.opendocument.spreadsheet', ext: '.ods' },
{ mime: 'application/vnd.oasis.opendocument.spreadsheet-template', ext: '.ots' },
{ mime: 'application/vnd.oasis.opendocument.text', ext: '.odt' },
{ mime: 'application/vnd.oasis.opendocument.text-master', ext: '.odm' },
{ mime: 'application/vnd.oasis.opendocument.text-template', ext: '.ott' },
{ mime: 'image/ktx', ext: '.ktx' },
{ mime: 'application/vnd.sun.xml.calc', ext: '.sxc' },
{ mime: 'application/vnd.sun.xml.calc.template', ext: '.stc' },
{ mime: 'application/vnd.sun.xml.draw', ext: '.sxd' },
{ mime: 'application/vnd.sun.xml.draw.template', ext: '.std' },
{ mime: 'application/vnd.sun.xml.impress', ext: '.sxi' },
{ mime: 'application/vnd.sun.xml.impress.template', ext: '.sti' },
{ mime: 'application/vnd.sun.xml.math', ext: '.sxm' },
{ mime: 'application/vnd.sun.xml.writer', ext: '.sxw' },
{ mime: 'application/vnd.sun.xml.writer.global', ext: '.sxg' },
{ mime: 'application/vnd.sun.xml.writer.template', ext: '.stw' },
{ mime: 'application/x-font-otf', ext: '.otf' },
{ mime: 'application/vnd.yamaha.openscoreformat.osfpvg+xml', ext: '.osfpvg' },
{ mime: 'application/vnd.osgi.dp', ext: '.dp' },
{ mime: 'application/vnd.palm', ext: '.pdb' },
{ mime: 'text/x-pascal', ext: '.p' },
{ mime: 'application/vnd.pawaafile', ext: '.paw' },
{ mime: 'application/vnd.hp-pclxl', ext: '.pclxl' },
{ mime: 'application/vnd.picsel', ext: '.efif' },
{ mime: 'image/x-pcx', ext: '.pcx' },
{ mime: 'image/vnd.adobe.photoshop', ext: '.psd' },
{ mime: 'application/pics-rules', ext: '.prf' },
{ mime: 'image/x-pict', ext: '.pic' },
{ mime: 'application/x-chat', ext: '.chat' },
{ mime: 'application/pkcs10', ext: '.p10' },
{ mime: 'application/x-pkcs12', ext: '.p12' },
{ mime: 'application/pkcs7-mime', ext: '.p7m' },
{ mime: 'application/pkcs7-signature', ext: '.p7s' },
{ mime: 'application/x-pkcs7-certreqresp', ext: '.p7r' },
{ mime: 'application/x-pkcs7-certificates', ext: '.p7b' },
{ mime: 'application/pkcs8', ext: '.p8' },
{ mime: 'application/vnd.pocketlearn', ext: '.plf' },
{ mime: 'image/x-portable-anymap', ext: '.pnm' },
{ mime: 'image/x-portable-bitmap', ext: '.pbm' },
{ mime: 'application/x-font-pcf', ext: '.pcf' },
{ mime: 'application/font-tdpfr', ext: '.pfr' },
{ mime: 'application/x-chess-pgn', ext: '.pgn' },
{ mime: 'image/x-portable-graymap', ext: '.pgm' },
{ mime: 'image/png', ext: '.png' },
{ mime: 'image/x-portable-pixmap', ext: '.ppm' },
{ mime: 'application/pskc+xml', ext: '.pskcxml' },
{ mime: 'application/vnd.ctc-posml', ext: '.pml' },
{ mime: 'application/postscript', ext: '.ai' },
{ mime: 'application/x-font-type1', ext: '.pfa' },
{ mime: 'application/vnd.powerbuilder6', ext: '.pbd' },
{ mime: 'application/pgp-encrypted', ext: '.pgp' },
{ mime: 'application/pgp-signature', ext: '.pgp' },
{ mime: 'application/vnd.previewsystems.box', ext: '.box' },
{ mime: 'application/vnd.pvi.ptid1', ext: '.ptid' },
{ mime: 'application/pls+xml', ext: '.pls' },
{ mime: 'application/vnd.pg.format', ext: '.str' },
{ mime: 'application/vnd.pg.osasli', ext: '.ei6' },
{ mime: 'text/prs.lines.tag', ext: '.dsc' },
{ mime: 'application/x-font-linux-psf', ext: '.psf' },
{ mime: 'application/vnd.publishare-delta-tree', ext: '.qps' },
{ mime: 'application/vnd.pmi.widget', ext: '.wg' },
{ mime: 'application/vnd.quark.quarkxpress', ext: '.qxd' },
{ mime: 'application/vnd.epson.esf', ext: '.esf' },
{ mime: 'application/vnd.epson.msf', ext: '.msf' },
{ mime: 'application/vnd.epson.ssf', ext: '.ssf' },
{ mime: 'application/vnd.epson.quickanime', ext: '.qam' },
{ mime: 'application/vnd.intu.qfx', ext: '.qfx' },
{ mime: 'video/quicktime', ext: '.qt' },
{ mime: 'application/x-rar-compressed', ext: '.rar' },
{ mime: 'audio/x-pn-realaudio', ext: '.ram' },
{ mime: 'audio/x-pn-realaudio-plugin', ext: '.rmp' },
{ mime: 'application/rsd+xml', ext: '.rsd' },
{ mime: 'application/vnd.rn-realmedia', ext: '.rm' },
{ mime: 'application/vnd.realvnc.bed', ext: '.bed' },
{ mime: 'application/vnd.recordare.musicxml', ext: '.mxl' },
{ mime: 'application/vnd.recordare.musicxml+xml', ext: '.musicxml' },
{ mime: 'application/relax-ng-compact-syntax', ext: '.rnc' },
{ mime: 'application/vnd.data-vision.rdz', ext: '.rdz' },
{ mime: 'application/rdf+xml', ext: '.rdf' },
{ mime: 'application/vnd.cloanto.rp9', ext: '.rp9' },
{ mime: 'application/vnd.jisp', ext: '.jisp' },
{ mime: 'application/rtf', ext: '.rtf' },
{ mime: 'text/richtext', ext: '.rtx' },
{ mime: 'application/vnd.route66.link66+xml', ext: '.link66' },
{ mime: 'application/rss+xml', ext: '.rss, .xml' },
{ mime: 'application/shf+xml', ext: '.shf' },
{ mime: 'application/vnd.sailingtracker.track', ext: '.st' },
{ mime: 'image/svg+xml', ext: '.svg' },
{ mime: 'application/vnd.sus-calendar', ext: '.sus' },
{ mime: 'application/sru+xml', ext: '.sru' },
{ mime: 'application/set-payment-initiation', ext: '.setpay' },
{ mime: 'application/set-registration-initiation', ext: '.setreg' },
{ mime: 'application/vnd.sema', ext: '.sema' },
{ mime: 'application/vnd.semd', ext: '.semd' },
{ mime: 'application/vnd.semf', ext: '.semf' },
{ mime: 'application/vnd.seemail', ext: '.see' },
{ mime: 'application/x-font-snf', ext: '.snf' },
{ mime: 'application/scvp-vp-request', ext: '.spq' },
{ mime: 'application/scvp-vp-response', ext: '.spp' },
{ mime: 'application/scvp-cv-request', ext: '.scq' },
{ mime: 'application/scvp-cv-response', ext: '.scs' },
{ mime: 'application/sdp', ext: '.sdp' },
{ mime: 'text/x-setext', ext: '.etx' },
{ mime: 'video/x-sgi-movie', ext: '.movie' },
{ mime: 'application/vnd.shana.informed.formdata', ext: '.ifm' },
{ mime: 'application/vnd.shana.informed.formtemplate', ext: '.itp' },
{ mime: 'application/vnd.shana.informed.interchange', ext: '.iif' },
{ mime: 'application/vnd.shana.informed.package', ext: '.ipk' },
{ mime: 'application/thraud+xml', ext: '.tfi' },
{ mime: 'application/x-shar', ext: '.shar' },
{ mime: 'image/x-rgb', ext: '.rgb' },
{ mime: 'application/vnd.epson.salt', ext: '.slt' },
{ mime: 'application/vnd.accpac.simply.aso', ext: '.aso' },
{ mime: 'application/vnd.accpac.simply.imp', ext: '.imp' },
{ mime: 'application/vnd.simtech-mindmapper', ext: '.twd' },
{ mime: 'application/vnd.commonspace', ext: '.csp' },
{ mime: 'application/vnd.yamaha.smaf-audio', ext: '.saf' },
{ mime: 'application/vnd.smaf', ext: '.mmf' },
{ mime: 'application/vnd.yamaha.smaf-phrase', ext: '.spf' },
{ mime: 'application/vnd.smart.teacher', ext: '.teacher' },
{ mime: 'application/vnd.svd', ext: '.svd' },
{ mime: 'application/sparql-query', ext: '.rq' },
{ mime: 'application/sparql-results+xml', ext: '.srx' },
{ mime: 'application/srgs', ext: '.gram' },
{ mime: 'application/srgs+xml', ext: '.grxml' },
{ mime: 'application/ssml+xml', ext: '.ssml' },
{ mime: 'application/vnd.koan', ext: '.skp' },
{ mime: 'text/sgml', ext: '.sgml' },
{ mime: 'application/vnd.stardivision.calc', ext: '.sdc' },
{ mime: 'application/vnd.stardivision.draw', ext: '.sda' },
{ mime: 'application/vnd.stardivision.impress', ext: '.sdd' },
{ mime: 'application/vnd.stardivision.math', ext: '.smf' },
{ mime: 'application/vnd.stardivision.writer', ext: '.sdw' },
{ mime: 'application/vnd.stardivision.writer-global', ext: '.sgl' },
{ mime: 'application/vnd.stepmania.stepchart', ext: '.sm' },
{ mime: 'application/x-stuffit', ext: '.sit' },
{ mime: 'application/x-stuffitx', ext: '.sitx' },
{ mime: 'application/vnd.solent.sdkm+xml', ext: '.sdkm' },
{ mime: 'application/vnd.olpc-sugar', ext: '.xo' },
{ mime: 'audio/basic', ext: '.au' },
{ mime: 'application/vnd.wqd', ext: '.wqd' },
{ mime: 'application/vnd.symbian.install', ext: '.sis' },
{ mime: 'application/smil+xml', ext: '.smi' },
{ mime: 'application/vnd.syncml+xml', ext: '.xsm' },
{ mime: 'application/vnd.syncml.dm+wbxml', ext: '.bdm' },
{ mime: 'application/vnd.syncml.dm+xml', ext: '.xdm' },
{ mime: 'application/x-sv4cpio', ext: '.sv4cpio' },
{ mime: 'application/x-sv4crc', ext: '.sv4crc' },
{ mime: 'application/sbml+xml', ext: '.sbml' },
{ mime: 'text/tab-separated-values', ext: '.tsv' },
{ mime: 'image/tiff', ext: '.tiff' },
{ mime: 'application/vnd.tao.intent-module-archive', ext: '.tao' },
{ mime: 'application/x-tar', ext: '.tar' },
{ mime: 'application/x-tcl', ext: '.tcl' },
{ mime: 'application/x-tex', ext: '.tex' },
{ mime: 'application/x-tex-tfm', ext: '.tfm' },
{ mime: 'application/tei+xml', ext: '.tei' },
{ mime: 'text/plain', ext: '.txt' },
{ mime: 'application/vnd.spotfire.dxp', ext: '.dxp' },
{ mime: 'application/vnd.spotfire.sfs', ext: '.sfs' },
{ mime: 'application/timestamped-data', ext: '.tsd' },
{ mime: 'application/vnd.trid.tpt', ext: '.tpt' },
{ mime: 'application/vnd.triscape.mxs', ext: '.mxs' },
{ mime: 'text/troff', ext: '.t' },
{ mime: 'application/vnd.trueapp', ext: '.tra' },
{ mime: 'application/x-font-ttf', ext: '.ttf' },
{ mime: 'text/turtle', ext: '.ttl' },
{ mime: 'application/vnd.umajin', ext: '.umj' },
{ mime: 'application/vnd.uoml+xml', ext: '.uoml' },
{ mime: 'application/vnd.unity', ext: '.unityweb' },
{ mime: 'application/vnd.ufdl', ext: '.ufd' },
{ mime: 'text/uri-list', ext: '.uri' },
{ mime: 'application/vnd.uiq.theme', ext: '.utz' },
{ mime: 'application/x-ustar', ext: '.ustar' },
{ mime: 'text/x-uuencode', ext: '.uu' },
{ mime: 'text/x-vcalendar', ext: '.vcs' },
{ mime: 'text/x-vcard', ext: '.vcf' },
{ mime: 'application/x-cdlink', ext: '.vcd' },
{ mime: 'application/vnd.vsf', ext: '.vsf' },
{ mime: 'model/vrml', ext: '.wrl' },
{ mime: 'application/vnd.vcx', ext: '.vcx' },
{ mime: 'model/vnd.mts', ext: '.mts' },
{ mime: 'model/vnd.vtu', ext: '.vtu' },
{ mime: 'application/vnd.visionary', ext: '.vis' },
{ mime: 'video/vnd.vivo', ext: '.viv' },
{ mime: 'application/ccxml+xml,', ext: '.ccxml' },
{ mime: 'application/voicexml+xml', ext: '.vxml' },
{ mime: 'application/x-wais-source', ext: '.src' },
{ mime: 'application/vnd.wap.wbxml', ext: '.wbxml' },
{ mime: 'image/vnd.wap.wbmp', ext: '.wbmp' },
{ mime: 'audio/x-wav', ext: '.wav' },
{ mime: 'application/davmount+xml', ext: '.davmount' },
{ mime: 'application/x-font-woff', ext: '.woff' },
{ mime: 'application/wspolicy+xml', ext: '.wspolicy' },
{ mime: 'image/webp', ext: '.webp' },
{ mime: 'application/vnd.webturbo', ext: '.wtb' },
{ mime: 'application/widget', ext: '.wgt' },
{ mime: 'application/winhlp', ext: '.hlp' },
{ mime: 'text/vnd.wap.wml', ext: '.wml' },
{ mime: 'text/vnd.wap.wmlscript', ext: '.wmls' },
{ mime: 'application/vnd.wap.wmlscriptc', ext: '.wmlsc' },
{ mime: 'application/vnd.wordperfect', ext: '.wpd' },
{ mime: 'application/vnd.wt.stf', ext: '.stf' },
{ mime: 'application/wsdl+xml', ext: '.wsdl' },
{ mime: 'image/x-xbitmap', ext: '.xbm' },
{ mime: 'image/x-xpixmap', ext: '.xpm' },
{ mime: 'image/x-xwindowdump', ext: '.xwd' },
{ mime: 'application/x-x509-ca-cert', ext: '.der' },
{ mime: 'application/x-xfig', ext: '.fig' },
{ mime: 'application/xhtml+xml', ext: '.xhtml' },
{ mime: 'application/xml', ext: '.xml' },
{ mime: 'application/xcap-diff+xml', ext: '.xdf' },
{ mime: 'application/xenc+xml', ext: '.xenc' },
{ mime: 'application/patch-ops-error+xml', ext: '.xer' },
{ mime: 'application/resource-lists+xml', ext: '.rl' },
{ mime: 'application/rls-services+xml', ext: '.rs' },
{ mime: 'application/resource-lists-diff+xml', ext: '.rld' },
{ mime: 'application/xslt+xml', ext: '.xslt' },
{ mime: 'application/xop+xml', ext: '.xop' },
{ mime: 'application/x-xpinstall', ext: '.xpi' },
{ mime: 'application/xspf+xml', ext: '.xspf' },
{ mime: 'application/vnd.mozilla.xul+xml', ext: '.xul' },
{ mime: 'chemical/x-xyz', ext: '.xyz' },
{ mime: 'text/yaml', ext: '.yaml' },
{ mime: 'application/yang', ext: '.yang' },
{ mime: 'application/yin+xml', ext: '.yin' },
{ mime: 'application/vnd.zul', ext: '.zir' },
{ mime: 'application/zip', ext: '.zip' },
{ mime: 'application/vnd.handheld-entertainment+xml', ext: '.zmm' },
{ mime: 'application/vnd.zzazz.deck+xml', ext: '.zaz' }];

//stop console log
console.log = function (message) { };

const arrRequests = [];
//const RANGE_SIZE = 1048576; //1 MB
const RANGE_SIZE = 67108864; //64 MB
const TIMEOUT = 30000 //30 secs
const broadcastToSw = new BroadcastChannel('channel-sfsw-tosw');
const broadcastFromSw = new BroadcastChannel('channel-sfsw-fromsw');

//listen to messages
broadcastToSw.onmessage = (event) => {
  if (event.data.length > 0) {
    //get request id and data
    var strRequestID = event.data.split('=')[0];

    console.log('sw recieved data RequestID', strRequestID)
    try {
      arrRequests[parseInt(strRequestID)].push(event.data.substring(strRequestID.length + 1));
    }
    catch (exc) {
      console.log('buffer write error', exc);
    }
  }
};

self.addEventListener('install', function (event) {
  event.waitUntil(self.skipWaiting());
  console.log('V1 installing...');
});

self.addEventListener('activate', function (event) {
  event.waitUntil(self.clients.claim());

  console.log('activate V1 now ready to handle fetches!');
});

self.addEventListener('fetch', function (event) {
  //get url
  const url = event.request.url;
  //extract from url
  const base = getFolder(url, 1);

  console.log('url SW', url)

  //just serve requests from download folder
  if (base === 'sfdownload') {
    var isFinished = false;
    var isError = false;
    var lastDataRecievedTime = Date.now();
    const requestID = arrRequests.length;
    arrRequests[requestID] = zlib_buffer();
    console.log('Handling fetch event for', url, base, requestID);

    //file name example
    // /sfdownload/${index}/${file.size}/${file.name}

    //extract info from file name
    var urlEndIndex = url.split('/').length - 1
    var urlArray = url.split('/')
    var fileName = decodeURIComponent(urlArray[urlEndIndex]);
    var fileSize = parseInt(urlArray[urlEndIndex - 1]);
    var fileIndex = parseInt(urlArray[urlEndIndex - 2]);

    //set defaults
    var isRangeRequest = false;
    var startPos = 0;
    var endPos = fileSize - 1;
    if (event.request.headers.get('range')) {
      //range request made
      isRangeRequest = true;
      const rangeHeader = event.request.headers.get('range');

      console.log('RANGE REQUEST MADE!')
      console.log(rangeHeader);

      //start pos - bytes=0-
      startPos = parseInt(rangeHeader.split('bytes=')[1].split('-')[0]);
      endPos = parseInt(rangeHeader.split('bytes=')[1].split('-')[1]);
      endPos = Number.isNaN(endPos) ? null : endPos;
      if (!endPos) {
        //end position not specified as range unknowen, return a sensible range end
        endPos = (startPos + RANGE_SIZE) < fileSize ? startPos + RANGE_SIZE : fileSize - 1;
        //endPos = fileSize - 1;
      }
    }
    var percentage = 0;
    var percentSent = -1;
    var pos = startPos;

    //send request for file
    sendMessageToClient({
      type: "send",
      data: {
        requestID,
        range: {
          startPos,
          endPos: endPos + 1
        },
        fileinfo: {
          name: fileName,
          size: fileSize,
          index: fileIndex,
        }
      }
    });

    sendMessageToClient({ type: "progress", data: { percent: 0 } });

    var stream = new ReadableStream({
      start(controller) {
        function push() {
          //save chunks
          while (arrRequests[requestID] !== undefined && arrRequests[requestID].length() > 0 && isFinished === false && isError === false) {
            var binaryData = base64toUint8Array(arrRequests[requestID].shift());
            var binaryDataLength = binaryData.length;

            if (binaryDataLength > 0) {
              //set position
              pos = pos + binaryDataLength;

              //update data recieved flag
              lastDataRecievedTime = Date.now();

              //calc percent prog and update 
              percentage = (((pos - startPos) / (endPos - startPos)) * 100).toFixed();
              if (percentSent !== percentage) {
                percentSent = percentage;
                sendMessageToClient({ type: "progress", data: { percent: percentSent } });
              }

              //add data to stream
              try {
                controller.enqueue(binaryData);
              }
              catch (exc) {
                //cancel = true;
                console.log('controller.enqueue error', exc);
                isError = true;
              }
            }
            else {
              //empty data sent signiling file end reached
              console.log('finished CALLED');
              isFinished = true;
            }
          }

          //check timeout
          if ((Date.now() - lastDataRecievedTime) > TIMEOUT) {
            isError = true;
          }

          //check finished
          console.log('finished', isFinished)
          if (isFinished || isError) {
            //end of stream - file successfully downloaded
            try {
              controller.close();
              console.log('sw STREAM CLOSED!');
            }
            catch (exc) {
              //cancel = true;
              console.log('controller.close error', exc)
            }

            if (isError) {
              //send server a cancel message
              sendMessageToClient({
                type: "cancel",
                data: {
                  requestID,
                }
              });

              console.log('sw isError!');
            }

            sendMessageToClient({ type: "progress", data: { percent: 100 } });

            //reset filebuffer
            arrRequests[requestID] = undefined;
          }
          else {
            //call next chunk
            setTimeout(push, 1);
          }
        }

        //start download off
        push();
      }
    });

    //response
    var init = {
      headers: [
        ['Content-Type', getMime(fileName) + '; charset=utf-8'],
        ['Content-Disposition', 'attachment; filename="' + fileName + '"'],
        ['Content-Length', fileSize]
      ]
    };

    if (isRangeRequest) {
      init = {
        status: 206,
        statusText: 'Partial Content',
        headers: [
          ['Accept-Ranges', 'bytes'],
          ['Content-Length', ((endPos - startPos) + 1)],
          ['Content-Type', getMime(fileName) + '; charset=utf-8'],
          ['Content-Range', 'bytes ' + startPos + '-' + endPos + '/' + fileSize]]
      }
    }

    var response = new Response(stream, init);
    event.respondWith(response);
  }
});

//comms
function sendMessageToClient(msg) {
  broadcastFromSw.postMessage(JSON.stringify(msg));
}

//high performace buffer implimantation
function zlib_buffer() {
  "use strict";
  var buffer = [];
  //clear
  function clear() {
    buffer.length = 0;
  }

  function push(data) {
    buffer.push(data);
  }

  //get length
  function getLength() {
    return buffer.length;
  }

  //gets first element
  function shift() {
    return buffer.shift();
  }

  return { push: push, shift: shift, clear: clear, length: getLength };
}

//base 64 to uint
function base64toUint8Array(base64Str) {
  //flag padding
  var toRemove = 0;
  if (base64Str.length > 1) {
    if (base64Str[base64Str.length - 2] === '=') {
      toRemove = 2;
    }
    else if (base64Str[base64Str.length - 1] === '=') {
      toRemove = 1;
    }
  }

  //set input
  const input = base64Str.substring(0, base64Str.length - toRemove);
  const keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  const bytes = Math.floor((input.length / 4) * 3, 10);
  var uarray;
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  var j = 0;
  uarray = new Uint8Array(bytes);

  for (i = 0; i < bytes; i += 3) {
    //get the 3 octects in 4 ascii chars
    enc1 = keyStr.indexOf(input[j++]);
    enc2 = keyStr.indexOf(input[j++]);
    enc3 = keyStr.indexOf(input[j++]);
    enc4 = keyStr.indexOf(input[j++]);

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    uarray[i] = chr1;
    uarray[i + 1] = chr2;
    uarray[i + 2] = chr3;
  }

  return uarray;
}

function getMime(filename) {
  var retVal = 'application/octet-stream';

  var fileExt = filename.split('.').pop();
  if (fileExt !== filename && fileExt.length < 6) {
    //file ext valid, lets search for mime type
    fileExt = '.' + fileExt.toLowerCase();

    for (var i = 0; i < mimes.length; i++) {
      if (mimes[i].ext === fileExt) {
        retVal = mimes[i].mime;
        break;
      }
    }
  }

  console.log(fileExt);
  console.log(retVal);

  return retVal;
}

function getFolder(url, folderPos) {
  const arrFolders = url.replace('://', '').split('/');
  if (arrFolders.length > folderPos) {
    return arrFolders[folderPos];
  }
  return null;
}
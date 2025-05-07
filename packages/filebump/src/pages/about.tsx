import { Container, Spacer, Txt, StyledBox, ButtonAdd } from "ui-components"

const Index = ({ onNavigate }: { onNavigate: any }) => {
  const handleNavClick = (url: string, replace: boolean = false) => {
    onNavigate(url, replace)
  }

  return (
    <Container uc="main">
      <StyledBox
        uc="solidBox"
        ucHover="solidBoxHover"
      >
        <Txt uc="boxHeading">About</Txt>
        <Spacer uc="small" />
        <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
          <Txt uc="boxTxtInfo">

            <p>Filebump was created to solve the problem of easily transferring a file onto another
              device.</p>

            <p>There are apps out there that will let you transfer files but would it be possible with
              the receiving device having no software installed other than a web browser? After all
              every device already has a web browser.</p>

            <p>There are several web based technologies that have matured recently that when combined
              allow a peer to peer transfer of files just using the browser.</p>

            <ol>
              <li>WebRTC &ndash; peer to peer communication inside the web browser.</li>
              <li>Web Service Workers &ndash; Allows the file to be streamed to you without using the
                browsers memory to hold the entire file.</li>
              <li>HTML5 File API &ndash; Allows the web browser to chunk pieces of large files into
                memory.</li>
            </ol>

            <p>Filebump is the first demonstration of all these technologies combined together to allow
              files of any size to be transferred in an efficient manner between web browsers. It is
              100% secure and private and genuinely peer to peer (p2p). It is built on top of WebRTC
              technology which is secure from the ground up.</p>

            <p>Being a peer to peer technology means if you are transferring files between 2 computers
              or devices on your home network, the files wont even get past your router and onto the
              internet, they will simply be transferred direct to the other machine.</p>

            <p>To set up the p2p connection Filebump has to use a signalling server. This is used to
              make the 2 devices aware of each to facilitate the p2p connection. Once the 2 machines
              are connected there are no other servers involved and the file transfer is 100% secure
              and private between the 2 machines.</p>

            <p>Filebump was set up to give everyone a secure easy to use way to
              transfer files.</p>
          </Txt>
        </div>
        <Spacer uc="medium" />
      </StyledBox>
    </Container>
  );
}

export default Index;

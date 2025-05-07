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
        <Txt uc="boxHeading">Privacy</Txt>
        <Spacer uc="small" />
        <div style={{ paddingLeft: "30px", paddingRight: "30px" }}>
          <Txt uc="boxTxtInfo">
            <p>Filebump is inherently private and secure. The file transfer is p2p (peer 2 peer) between
              the 2 devices. Your files are never stored on another server and are transferred in
              realtime directly between the 2 devices.</p>

            <p>To set up the p2p connection Filebump has to use a signalling server. This is used to
              make the 2 devices aware of each to facilitate the p2p connection. Once the 2 machines
              are connected there are no other servers involved and the file transfer is 100% secure
              and private between the 2 machines.</p>

            <p>WebRTC uses a set of 'contracts' to secure the peer
              to peer connection. These contracts must be stored on the signalling server. Once the
              connection is established, these contracts are deleted from our signalling server.</p>

            <p>Filebump is built on top of WebRTC technology which is inherently private and secure from
              the ground up.</p>

            <p>An anonymous UUID (universally unique identifier) is generated for each file transfer session
               and stored on our servers to track usage but that is all. No other information is stored by Filebump,
               not even cookies. Open developer tools and check for yourself!.</p>

            <p>In short we respect your privacy and store no unnecessary information.</p>
          </Txt>
        </div>
        <Spacer uc="medium" />
      </StyledBox>
    </Container>
  );
}

export default Index;

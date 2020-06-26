import { h } from "preact";
import Header from "../home/header";
import Footer from "../home/footer";
import Container from "../home/container";

const Contact = () => (
  <Container>
    <Header />
    <main class="px-3">
      <h1>Contact</h1>
    </main>
    <Footer />
  </Container>
);

export default Contact;

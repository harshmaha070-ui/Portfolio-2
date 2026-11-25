import { MdArrowOutward, MdCopyright } from "react-icons/md";
import "./styles/Contact.css";

const Contact = () => {
  return (
    <div className="contact-section section-container" id="contact">
      <div className="contact-container">
        <h3>Let&apos;s Work Together</h3>
        <div className="contact-flex">
          <div className="contact-box">
            <h4>Email</h4>
            <p>
              <a href="mailto:harshmaha070@gmail.com" data-cursor="disable">
                harshmaha070@gmail.com
              </a>
            </p>
            <h4>Phone</h4>
            <p>
              <a href="tel:+917383445704" data-cursor="disable">
                +91 7383445704
              </a>
            </p>
            <h4>Location</h4>
            <p>Rakhiyal, Ahmedabad, Gujarat, India 380021</p>
          </div>
          <div className="contact-box">
            <h4>Social &amp; Collaborate</h4>
            <a
              href="https://www.instagram.com/typebyharsh?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
              target="_blank"
              rel="noopener noreferrer"
              data-cursor="disable"
              className="contact-social"
            >
              Instagram (@typebyharsh) <MdArrowOutward />
            </a>
            <a
              href="mailto:harshmaha070@gmail.com"
              data-cursor="disable"
              className="contact-social"
            >
              Email Directly <MdArrowOutward />
            </a>
          </div>
          <div className="contact-box">
            <h2>
              Video Editing Portfolio <br /> of <span>Harsh (@typebyharsh)</span>
            </h2>
            <h5>
              <MdCopyright /> 2026
            </h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

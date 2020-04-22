import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ENDPOINT } from '../config';
import LazyLoad from 'react-lazy-load';
// import $ from 'jquery';

function FAQ() {
	const [faq, setFaq] = useState([]);

	useEffect(() => {
		getFAQs();
	}, []);

	// useEffect(()=>{
	//   var windowBottom = $(window).scrollTop() + $(window).innerHeight();
	//   $(".animate").each(function () {
	//     /* Check the location of each desired element */
	//     var objectBottom = $(this).offset().top;

	//     /* If the element is completely within bounds of the window, fade it in */
	//     if (objectBottom < windowBottom) { //object comes into view (scrolling down)
	//       $(this).removeClass('animate').addClass('fadeInUp')
	//     } else { //object goes out of view (scrolling up)
	//       // if ($(this).css("opacity")==1) {$(this).fadeTo(500,0);}
	//     }
	//   });
	// },[faq])

	const getFAQs = () => {
		axios
			.get(ENDPOINT + '/guidelines.json')
			.then((response) => {
				setFaq(response.data.faq);
			})
			.catch((error) => {
				console.log(error);
			});
	};

	return (
		<div className="FAQ">
			<div className="faq-left">
				<div className="video-holder">
					<div>
						<video
							src="/videos/vid1.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
						></video>
						<video
							src="/videos/vid2.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
						></video>
					</div>
					<div>
						<video
							src="/videos/vid5.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
						></video>
						<video
							src="/videos/vid4.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
						></video>
					</div>
					<div>
						<video
							src="/videos/vid3.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
						></video>
						<video
							src="/videos/vid6.mp4"
							controls={true}
							className="faq-video fadeInUp"
							style={{ animationDelay: '0.5s' }}
						></video>
					</div>
				</div>
			</div>
			<div className="faq-right">
				<div className="fadeInUp faq">
					<LazyLoad offsetVertical={200}>
						<img src="/images/mohfw-logo.jpg" className="mohfw-logo" alt={'MOHFW logo'} />
					</LazyLoad>
					<h3>द्वारा जनहित में जारी</h3>
					<h1>सामान्य प्रश्न</h1>
				</div>
				{!faq.length && <div class="lds-dual-ring"></div>}
				{faq.map((faq, index) => {
					return (
						<div
							key={index}
							className="faq fadeInUp"
							style={{ animationDelay: `${Math.min(0.8, 0.5 + index * 0.1)}s` }}
						>
							<h2 className="question">{faq.question}</h2>
							<h2 className="answer">{faq.answer}</h2>
						</div>
					);
				})}
			</div>
		</div>
	);
}

export default FAQ;

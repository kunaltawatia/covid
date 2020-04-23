import React, { useState, useEffect } from 'react';
// import $ from 'jquery';

function Acknowledgement(props) {
	return (
		<div className="Acknowledgment">
			<div className="fadeInUp faq">
				<h1>स्वीकृति</h1>
				<h3>टीम का विवरण</h3>
			</div>

			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">तकनीकी टीम</h2>
				<div className="portfolio-holder">
					<img className="portfolio" src="/images/kunal.jpg"></img>
					<div>
						<a href="http://home.iitj.ac.in/~tawatia.1" target="_noblank">
							<h2>Kunal Tawatia</h2>
						</a>
						<h2 className="answer">डिवेलॅप्मॅन्ट एवं इंजीनियरिंग</h2>
						<h3>
							B.Tech. CSE 2018
							<br />
							कंप्यूटर विज्ञान और इंजीनियरिंग विभाग <br /> IIT जोधपुर
						</h3>
					</div>
				</div>
			</div>
			<br />
			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">मेंटर्स</h2>
				<h2>Prof. Santanu Chaudhury</h2>
				<h2 className="answer">निदेशक, IIT जोधपुर</h2>
				<h3>प्रोफेसर, संगणक विज्ञान एवं अभियांत्रिकी विभाग, IIT जोधपुर</h3>
				<h3>प्रोफेसर, विद्युत अभियान्त्रिकी विभाग, IIT दिल्ली (लिअन)</h3>
				<h3>पूर्व निदेशक, सीएसआईआर-सीईईआरआई पिलानी</h3>
				<h3>FNAE, FNASc, FIAPR</h3>
				<br />
				<div className="portfolio-holder">
					<img className="portfolio" src="/images/sumitk.jpg"></img>
					<div>
						<a href="http://home.iitj.ac.in/~sumitk" target="_noblank">
							<h2>Dr. Sumit Kalra</h2>
						</a>
						<h2 className="answer">परियोजना अन्वेषक</h2>
						<h3>
							सहायक प्रोफेसर
							<br />
							कंप्यूटर विज्ञान और इंजीनियरिंग विभाग <br />
							IIT जोधपुर
						</h3>
					</div>
				</div>
				<div className="portfolio-holder" style={{ marginTop: '2rem' }}>
					<img
						className="portfolio"
						src="/images/software-inn.png"
						style={{ border: 'none' }}
					></img>
					<div>
						<a href="http://home.iitj.ac.in/~sumitk" target="_noblank">
							<h2>Software Innovation Lab</h2>
						</a>
						<h3>IIT जोधपुर</h3>
					</div>
				</div>
			</div>
			<br />
			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">नैदानिक सहायता</h2>
				<h2>Dr. Kuldeep Singh</h2>
				<h2 className="answer">डीन (शिक्षाविद)</h2>
				<h3>AIIMS जोधपुर</h3>
				<br />
			</div>
			<br />
			<div className="faq fadeInUp" style={{ animationDelay: `0.5s` }}>
				<h2 className="question">प्रायोजक और सहायता</h2>
				<h2>Dr. Ashish Agarwal</h2>
				<h2 className="answer">संस्थापक और मुख्य कार्यकारी अधिकारी</h2>
				<h3>NPBridge</h3>
				<br />
				<h2>Mr. Ravi Mula</h2>
				<h3>NPBridge</h3>
			</div>
		</div>
	);
}

export default Acknowledgement;

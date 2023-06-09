import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Button, Form } from 'react-bootstrap';
import { useAuth0 } from '@auth0/auth0-react';
import AddReview from './AddReview';
import 'bootstrap/dist/css/bootstrap.min.css';


export default function Reviews() {
    const [reviews, setReviews] = useState([]); //array of reviews
    const [likes, setLikes] = useState(0); //counter for faves
    const [disLikes, setDislikes] = useState(0)
    const [editingReview, setEditingReview] = useState(null); //review currently editing
    const [show, setShow] = useState(false);// control the modal
    const { getAccessTokenSilently } = useAuth0();
    const { isAuthenticated } = useAuth0();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [filteredReviews, setFilteredReviews] = useState([]);

    useEffect(() => {
        fetchReviews(); //runs the func when first rendered
    }, []);

    function reviewLikes() {
        setLikes(likes + 1)
    }
    function reviewdisLikes() {
        setDislikes(disLikes + 1)
    }

    const fetchReviews = async () => { //sends the get req to fethc rev from server
        try {
            let config = {}; // configuration for axios request
            if (isAuthenticated) {
                const token = await getAccessTokenSilently({
                    audience: 'bitteruserapi',
                    scope: 'openid profile email'
                });
                config = {
                    headers: {
                        authorization: `Bearer ${token}`,
                    }
                };
            }
            const response = await axios.get('http://localhost:3001/post', config);
            setReviews(response.data);
            applyFilters(); 
        } catch (error) {
            if (error.response && error.response.status === 429) {
                console.error('Rate limit exceeded. Please try again later -Auth0.');
              } else {
                console.error('Error fetching reviews:', error.message);
              }
        }
    };

    const handleReviewSubmit = async (review) => { // accepts the obj, sends post req to http to add review to server and
        //refetches the reviews
        try {
            const token = await getAccessTokenSilently({
                audience: 'bitteruserapi',
                scope: 'openid profile email'
            });

            const response = await axios.post('http://localhost:3001/post', review,
                {
                    headers: {
                        authorization: `Bearer ${token}`,
                    }
                }
            );
            if (response.status === 200) {

                fetchReviews();

            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleReviewDelete = async (id) => { //accepts postId, sends the delete req to delete the review with the id, refetches
        try {
            const token = await getAccessTokenSilently({
                audience: 'bitteruserapi',
                scope: 'openid profile email'
            });

            const response = await axios.delete(`http://localhost:3001/post/${id}`
                , {
                    headers: {
                        authorization: `Bearer ${token}`,
                    }
                }
            );
            if (response.status === 204) {

                fetchReviews();

            }
        } catch (error) {
            console.error('Error deleting review:', error.message);
        }
    }

    const handleReviewEdit = (review) => { //accepts the review obj, stores the review in editting rev state variable, sets show to true, which triggers the modal for adding a review

        setEditingReview(review);
        setShow(true)
    };
    const applyFilters = () => {
        let filteredResults = reviews; // Start with all reviews

        // Apply search query filter
        if (searchQuery) {
            filteredResults = filteredResults.filter((review) =>
                review.title.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        // Apply category filter
        if (selectedCategory) {
            filteredResults = filteredResults.filter(
                (review) => review.category === selectedCategory
            );
        }
        console.log(filteredResults)
        console.log(reviews)
        setFilteredReviews(filteredResults); // Update filteredReviews
    };

    const handleSearch = () => {
        applyFilters();
    };
    const handleShow = () => setShow(true); // sets show to true which triggers modal for adding review

    const censorWords = ['kill', 'stab', 'die', 'asshole']; // List of bad words to censor

    const censorContent = (content) => {
      let censoredContent = content;
      
      // Replace bad words with asterisks
      censorWords.forEach((word) => {
        const regex = new RegExp(word, 'gi'); //g = gloabl i = case sensitive
        censoredContent = censoredContent.replace(regex, '*'.repeat(word.length));
      });
      
      return censoredContent;
    };


    return (
        <div>
            <div><AddReview //this components edits and adds reviews, passing down props
                handleReviewSubmit={handleReviewSubmit}
                editingReview={editingReview}
                fetchReviews={fetchReviews}
                onReviewEdit={setEditingReview}
                handleShow={handleShow}
                setShow={setShow}
                show={show}
                onHide={() => setShow(false)}
            /></div>
            <div className="search-form">

                <Form.Select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    <option value="">All Categories</option>
                    <option value="Restaurants & Food">#BiteSizedReviews 🍔</option>
                    <option value="Movies & Entertainment">#CinemaCritic 🍿</option>
                    <option value="Retail & Shopping">#RetailShowdown 🛍️</option>
                    <option value="Travel & Hospitality">#TravelTrials ✈️</option>
                    <option value="Education & Learning">#EducationEvaluations 🎓</option>
                    <option value="Jobs & Workplaces">#TheOfficeChronicles 💼</option>
                    <option value="Public Services & Government">#GovernmentGripes 🏛️</option>
                    <option value="Healthcare Services">#HealthcareHeroes&Hurdles 🩺</option>
                    <option value="Other">#TheUncharted 🎭</option>
                </Form.Select>
                <button className='LoginButton' style={{marginBottom: '10px', marginTop:'10px'}} onClick={handleSearch}>Search</button>
            </div>

            <div className="cards">
                {filteredReviews.length > 0 || searchQuery || selectedCategory ? ( //map iterates over each review and creates a card with buttons
                    filteredReviews.map((review) => (
                        <div key={review._id} >
                            <Card key={review._id}>
                                <Card.Body>
                                    <Card.Title> {censorContent(review.title)} </Card.Title>
                                    <Card.Subtitle>{review.category}</Card.Subtitle>
                                    <Card.Text>{censorContent(review.description)}</Card.Text>
                                    <p>{review.rating}/5</p>
                                </Card.Body>
                                {isAuthenticated && (

                                    <div className='cardButtons'>
                                        <Button variant="primary" onClick={() => { handleReviewEdit(review); }}>
                                            Edit Review
                                        </Button>
                                        <Button variant='danger' onClick={() => handleReviewDelete(review._id)}>Delete Review</Button>
                                        <Button variant='primary' onClick={reviewLikes}>👍{likes}</Button>
                                        <Button variant='primary' onClick={reviewdisLikes}>👎{disLikes}</Button>

                                    </div>
                                )}
                            </Card>
                        </div>
                    ))
                ) : (
                    <h3>No reviews found. Log-in and Post a review!</h3>
                )}
            </div>
        </div>
    );
}
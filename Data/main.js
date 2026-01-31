//HTTP request get,get/id,post,put/id, delete/id
async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json()
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of posts) {
            // Kiểm tra nếu post bị xóa mềm thì thêm style gạch ngang
            const isDeleted = post.isDeleted === true;
            const style = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
            // Ẩn nút edit và delete nếu đã xóa mềm
            const editButton = isDeleted ? '' : `<input type='submit' value='edit' onclick='EditPost("${post.id}")'/>`;
            const deleteButton = isDeleted ? '' : `<input type='submit' value='delete' onclick='Delete("${post.id}")'/>`;
            body.innerHTML += `<tr ${style}>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    ${deleteButton}
                    ${editButton}
                </td>
            </tr>`
        }
        return false;
    } catch (error) {
        console.log(error);
    }
}

// Lấy ID tự động tăng (maxId + 1)
async function getNextId() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        if (posts.length === 0) {
            return "1";
        }
        // Tìm maxId và tăng lên 1, chuyển thành chuỗi
        let maxId = Math.max(...posts.map(p => parseInt(p.id) || 0));
        return String(maxId + 1);
    } catch (error) {
        console.log(error);
        return "1";
    }
}

async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("view_txt").value;
    
    // Nếu ID trống, tạo mới với ID tự động
    if (!id || id.trim() === "") {
        id = await getNextId();
        let res = await fetch('http://localhost:3000/posts',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: id,
                        title: title,
                        views: views,
                        isDeleted: false
                    }
                )
            })
        if (res.ok) {
            console.log("them du lieu thanh cong");
            // Xóa form sau khi tạo thành công
            document.getElementById("id_txt").value = "";
            document.getElementById("title_txt").value = "";
            document.getElementById("view_txt").value = "";
        }
    } else {
        // Cập nhật post hiện có
        let getItem = await fetch("http://localhost:3000/posts/" + id);
        if (getItem.ok) {
            let existingPost = await getItem.json();
            // Kiểm tra nếu post đã bị xóa mềm thì không cho phép cập nhật
            if (existingPost.isDeleted === true) {
                alert("Không thể cập nhật post đã bị xóa mềm!");
                return;
            }
            let res = await fetch('http://localhost:3000/posts/' + id,
                {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        {
                            id: id,
                            title: title,
                            views: views,
                            isDeleted: existingPost.isDeleted || false
                        }
                    )
                })
            if (res.ok) {
                console.log("edit du lieu thanh cong");
                // Xóa form sau khi cập nhật thành công
                document.getElementById("id_txt").value = "";
                document.getElementById("title_txt").value = "";
                document.getElementById("view_txt").value = "";
            }
        }
    }
    LoadData();
    LoadComments();
}

// Xóa mềm: thêm isDeleted: true
async function Delete(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true
        })
    });
    if (res.ok) {
        console.log("xoa mem thanh cong");
    }
    LoadData();
}

// Chỉnh sửa post
async function EditPost(id) {
    try {
        let res = await fetch('http://localhost:3000/posts/' + id);
        let post = await res.json();
        // Kiểm tra nếu post đã bị xóa mềm thì không cho phép edit
        if (post.isDeleted === true) {
            alert("Không thể chỉnh sửa post đã bị xóa mềm!");
            return;
        }
        document.getElementById("id_txt").value = post.id;
        document.getElementById("title_txt").value = post.title;
        document.getElementById("view_txt").value = post.views;
    } catch (error) {
        console.log(error);
    }
}

// ========== CRUD COMMENTS ==========

// Load comments cho một post
async function LoadComments(postId = null) {
    try {
        let url = 'http://localhost:3000/comments';
        if (postId) {
            url += '?postId=' + postId;
        }
        let res = await fetch(url);
        let comments = await res.json();
        let body = document.getElementById("comments-body");
        if (!body) return;
        
        body.innerHTML = "";
        for (const comment of comments) {
            const isDeleted = comment.isDeleted === true;
            const style = isDeleted ? 'style="text-decoration: line-through; opacity: 0.6;"' : '';
            // Ẩn nút edit và delete nếu đã xóa mềm
            const editButton = isDeleted ? '' : `<input type='submit' value='edit' onclick='EditComment("${comment.id}")'/>`;
            const deleteButton = isDeleted ? '' : `<input type='submit' value='delete' onclick='DeleteComment("${comment.id}")'/>`;
            body.innerHTML += `<tr ${style}>
                <td>${comment.id}</td>
                <td>${comment.postId}</td>
                <td>${comment.content}</td>
                <td>${comment.author || ''}</td>
                <td>
                    ${deleteButton}
                    ${editButton}
                </td>
            </tr>`
        }
    } catch (error) {
        console.log(error);
    }
}

// Lấy ID tự động tăng cho comments
async function getNextCommentId() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        if (comments.length === 0) {
            return "1";
        }
        let maxId = Math.max(...comments.map(c => parseInt(c.id) || 0));
        return String(maxId + 1);
    } catch (error) {
        console.log(error);
        return "1";
    }
}

// Lưu comment (tạo mới hoặc cập nhật)
async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value;
    let postId = document.getElementById("comment_postId_txt").value;
    let content = document.getElementById("comment_content_txt").value;
    let author = document.getElementById("comment_author_txt").value;
    
    if (!id || id.trim() === "") {
        // Tạo mới
        id = await getNextCommentId();
        let res = await fetch('http://localhost:3000/comments',
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: id,
                        postId: postId,
                        content: content,
                        author: author,
                        isDeleted: false
                    }
                )
            })
        if (res.ok) {
            console.log("them comment thanh cong");
            // Xóa form
            document.getElementById("comment_id_txt").value = "";
            document.getElementById("comment_postId_txt").value = "";
            document.getElementById("comment_content_txt").value = "";
            document.getElementById("comment_author_txt").value = "";
        }
    } else {
        // Cập nhật
        let getItem = await fetch("http://localhost:3000/comments/" + id);
        if (getItem.ok) {
            let existingComment = await getItem.json();
            // Kiểm tra nếu comment đã bị xóa mềm thì không cho phép cập nhật
            if (existingComment.isDeleted === true) {
                alert("Không thể cập nhật comment đã bị xóa mềm!");
                return;
            }
            let res = await fetch('http://localhost:3000/comments/' + id,
                {
                    method: 'PUT',
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(
                        {
                            id: id,
                            postId: postId,
                            content: content,
                            author: author,
                            isDeleted: existingComment.isDeleted || false
                        }
                    )
                })
            if (res.ok) {
                console.log("edit comment thanh cong");
                // Xóa form
                document.getElementById("comment_id_txt").value = "";
                document.getElementById("comment_postId_txt").value = "";
                document.getElementById("comment_content_txt").value = "";
                document.getElementById("comment_author_txt").value = "";
            }
        }
    }
    LoadComments();
}

// Xóa mềm comment
async function DeleteComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            isDeleted: true
        })
    });
    if (res.ok) {
        console.log("xoa mem comment thanh cong");
    }
    LoadComments();
}

// Chỉnh sửa comment
async function EditComment(id) {
    try {
        let res = await fetch('http://localhost:3000/comments/' + id);
        let comment = await res.json();
        // Kiểm tra nếu comment đã bị xóa mềm thì không cho phép edit
        if (comment.isDeleted === true) {
            alert("Không thể chỉnh sửa comment đã bị xóa mềm!");
            return;
        }
        document.getElementById("comment_id_txt").value = comment.id;
        document.getElementById("comment_postId_txt").value = comment.postId;
        document.getElementById("comment_content_txt").value = comment.content;
        document.getElementById("comment_author_txt").value = comment.author || "";
    } catch (error) {
        console.log(error);
    }
}

// Load dữ liệu khi trang được tải
LoadData();
LoadComments();
